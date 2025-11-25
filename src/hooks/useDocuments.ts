import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Интерфейс документа
export interface Document {
  id: string;
  name: string;
  comment?: string;
  file_size: string;
  file_type: string;
  file_url: string;
  file_path: string;
  entity_type: 'client';
  entity_id: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
}

// Интерфейс для создания документа
interface CreateDocumentData {
  name: string;
  comment?: string;
  file: File;
  entity_type: 'client';
  entity_id: string;
}

export const useDocuments = (
  entityType?: 'client', 
  entityId?: string
) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const BUCKET_NAME = 'crm.gbs';

  // Функция получения документов
  const fetchDocuments = async () => {
    if (!entityType || !entityId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_gbs_documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return { error };
      }

      setDocuments(data || []);
      return { data };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Санитизация имени папки
  const sanitizeFolderName = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Удаляем спецсимволы
      .replace(/\s+/g, '-') // Пробелы → дефисы
      .toLowerCase()
      .substring(0, 50); // Ограничение длины
  };

  // Функция загрузки документа
  const uploadDocument = async (data: CreateDocumentData) => {
    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      // 1. Получаем имя клиента для создания папки
      let entityName = '';
      if (data.entity_type === 'client') {
        const { data: clientData } = await supabase
          .from('gbs_crm_clients')
          .select('first_name, last_name')
          .eq('id', data.entity_id)
          .single();
        
        entityName = clientData 
          ? `${clientData.first_name || ''} ${clientData.last_name || ''}`.trim() || `client-${data.entity_id}`
          : `client-${data.entity_id}`;
      }

      // 2. Создаем путь к файлу
      const folderName = sanitizeFolderName(entityName);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = data.file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${data.name.replace(/[^a-zA-Z0-9.-]/g, '_')}${fileExtension ? `.${fileExtension}` : ''}`;
      const filePath = `documents/${folderName}/${fileName}`;

      // 3. Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, data.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError.message };
      }

      // 4. Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // 5. Получаем email пользователя для created_by_name
      const userName = user.email || 'Unknown';

      // 6. Сохраняем метаданные в БД
      const documentData = {
        name: data.name,
        comment: data.comment,
        file_size: formatFileSize(data.file.size),
        file_type: data.file.type,
        file_url: urlData.publicUrl,
        file_path: filePath,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        created_by: user.id,
        created_by_name: userName
      };

      const { data: newDocument, error: dbError } = await supabase
        .from('crm_gbs_documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Cleanup: удаляем файл из Storage
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        return { error: dbError.message };
      }

      // 7. Обновляем локальное состояние
      setDocuments(prev => [newDocument, ...prev]);
      
      return { data: newDocument };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { error: 'Failed to upload document' };
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления документа
  const deleteDocument = async (documentId: string) => {
    setLoading(true);
    try {
      // 1. Получаем путь к файлу
      const { data: docData, error: fetchError } = await supabase
        .from('crm_gbs_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        return { error: fetchError.message };
      }

      // 2. Удаляем из Storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([docData.file_path]);

      if (storageError) {
        console.error('Storage error:', storageError);
        // Продолжаем удаление из БД даже если не удалось из Storage
      }

      // 3. Удаляем из БД
      const { error: dbError } = await supabase
        .from('crm_gbs_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('Database error:', dbError);
        return { error: dbError.message };
      }

      // 4. Обновляем локальное состояние
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { error: 'Failed to delete document' };
    } finally {
      setLoading(false);
    }
  };

  // Вспомогательная функция форматирования размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (entityType && entityId) {
      fetchDocuments();
    }
  }, [entityType, entityId]);

  return {
    documents,
    loading,
    uploadDocument,
    deleteDocument,
    fetchDocuments
  };
};

