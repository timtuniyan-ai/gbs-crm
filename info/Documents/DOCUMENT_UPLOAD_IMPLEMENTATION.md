# Документация: Система загрузки документов через Supabase

## Обзор системы

Система позволяет загружать, хранить и управлять документами для различных сущностей (лиды, сделки, контакты) с использованием **Supabase Storage** для файлов и **Supabase Database** для метаданных.

---

## Архитектура

```
┌─────────────────┐
│  React Component│
│  (LeadDetails)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useDocuments   │ ◄── Custom Hook
│     Hook        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Supabase│ │   Supabase   │
│ Storage │ │   Database   │
│ (файлы) │ │ (метаданные) │
└─────────┘ └──────────────┘
```

---

## Шаг 1: Настройка Supabase Storage

### 1.1 Создание Storage Bucket

В Supabase Dashboard → Storage → Create bucket:

```
Bucket Name: crm.gbs
Public bucket: ✓ (включить для публичного доступа к файлам)
```

### 1.2 Настройка политик доступа (RLS Policies)

```sql
-- Политика для загрузки файлов (INSERT)
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crm.gbs');

-- Политика для чтения файлов (SELECT)
CREATE POLICY "Public can view files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'crm.gbs');

-- Политика для удаления файлов (DELETE)
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'crm.gbs');
```

---

## Шаг 2: Создание таблицы для метаданных

### 2.1 SQL скрипт создания таблицы

```sql
CREATE TABLE crm_gbs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация о документе
  name TEXT NOT NULL,
  comment TEXT,
  
  -- Информация о файле
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  
  -- Связь с сущностью (lead, deal, contact)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'contact')),
  entity_id UUID NOT NULL,
  
  -- Аудит
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_by_name TEXT NOT NULL
);

-- Индексы для быстрого поиска
CREATE INDEX idx_documents_entity ON crm_gbs_documents(entity_type, entity_id);
CREATE INDEX idx_documents_created_at ON crm_gbs_documents(created_at DESC);

-- RLS политики
ALTER TABLE crm_gbs_documents ENABLE ROW LEVEL SECURITY;

-- Политика на чтение
CREATE POLICY "Users can view documents"
ON crm_gbs_documents
FOR SELECT
TO authenticated
USING (true);

-- Политика на создание
CREATE POLICY "Users can create documents"
ON crm_gbs_documents
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Политика на удаление
CREATE POLICY "Users can delete documents"
ON crm_gbs_documents
FOR DELETE
TO authenticated
USING (true);
```

### 2.2 Предоставление прав

```sql
GRANT ALL ON crm_gbs_documents TO authenticated;
GRANT ALL ON crm_gbs_documents TO anon;
```

---

## Шаг 3: Создание Custom Hook (useDocuments)

### 3.1 Структура файла

Создайте файл `src/hooks/useDocuments.ts`:

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../providers/AuthProvider';

// Интерфейс документа
export interface Document {
  id: string;
  name: string;
  comment?: string;
  file_size: string;
  file_type: string;
  file_url: string;
  file_path: string;
  entity_type: 'lead' | 'deal' | 'contact';
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
  entity_type: 'lead' | 'deal' | 'contact';
  entity_id: string;
}

export const useDocuments = (
  entityType?: 'lead' | 'deal' | 'contact', 
  entityId?: string
) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuthContext();

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
    if (!profile?.id) {
      return { error: 'User not authenticated' };
    }

    setLoading(true);
    try {
      // 1. Получаем имя сущности для создания папки
      let entityName = '';
      if (data.entity_type === 'lead') {
        const { data: leadData } = await supabase
          .from('crm_gbs_leads')
          .select('company_name')
          .eq('id', data.entity_id)
          .single();
        entityName = leadData?.company_name || `lead-${data.entity_id}`;
      } else if (data.entity_type === 'deal') {
        const { data: dealData } = await supabase
          .from('crm_gbs_deals')
          .select('company_name')
          .eq('id', data.entity_id)
          .single();
        entityName = dealData?.company_name || `deal-${data.entity_id}`;
      } else if (data.entity_type === 'contact') {
        const { data: contactData } = await supabase
          .from('crm_gbs_contacts')
          .select('first_name, last_name, company')
          .eq('id', data.entity_id)
          .single();
        entityName = contactData 
          ? `${contactData.first_name || ''} ${contactData.last_name || ''}`.trim() 
            || contactData.company 
            || `contact-${data.entity_id}`
          : `contact-${data.entity_id}`;
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

      // 5. Сохраняем метаданные в БД
      const documentData = {
        name: data.name,
        comment: data.comment,
        file_size: formatFileSize(data.file.size),
        file_type: data.file.type,
        file_url: urlData.publicUrl,
        file_path: filePath,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        created_by: profile.id,
        created_by_name: profile.name || profile.email || 'Unknown'
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

      // 6. Обновляем локальное состояние
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
```

---

## Шаг 4: Интеграция в компонент

### 4.1 Импорт и инициализация хука

```typescript
import { useDocuments } from '../hooks/useDocuments';

const LeadDetails = ({ lead }) => {
  // Инициализация хука
  const { 
    documents, 
    loading: documentsLoading, 
    uploadDocument, 
    deleteDocument 
  } = useDocuments('lead', lead.id);

  // Состояния для UI
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentComment, setDocumentComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... остальной код
};
```

### 4.2 Обработчики событий

```typescript
// Обработчик выбора файла
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setDocumentName(file.name);
    setShowDocumentUpload(true);
  }
};

// Обработчик загрузки документа
const handleDocumentUpload = async () => {
  const file = fileInputRef.current?.files?.[0];
  if (file && documentName.trim()) {
    const result = await uploadDocument({
      name: documentName,
      comment: documentComment || undefined,
      file: file,
      entity_type: 'lead',
      entity_id: lead.id
    });
    
    if (result.error) {
      console.error('Error uploading document:', result.error);
      toast.error('Failed to upload document', {
        description: result.error
      });
    } else {
      // Сброс формы
      setDocumentName('');
      setDocumentComment('');
      setShowDocumentUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Document uploaded successfully!');
    }
  }
};

// Обработчик удаления документа
const handleDeleteDocument = async (documentId: string) => {
  const documentToDelete = documents.find(doc => doc.id === documentId);
  const documentName = documentToDelete ? documentToDelete.name : 'Документ';
  
  // Показываем подтверждение
  const confirmed = window.confirm(
    `Вы уверены, что хотите удалить документ "${documentName}"?`
  );
  
  if (confirmed) {
    const result = await deleteDocument(documentId);
    if (result.error) {
      console.error('Error deleting document:', result.error);
      toast.error('Failed to delete document', {
        description: result.error
      });
    } else {
      toast.success('Document deleted successfully!');
    }
  }
};

// Вспомогательная функция для иконок файлов
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return FileVideo;
  if (fileType.startsWith('audio/')) return FileAudio;
  return File;
};

// Форматирование даты
const formatDocumentTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};
```

### 4.3 UI компонент (JSX)

```tsx
<TabsContent value="documents" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Documents ({documents?.length || 0})
        </div>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </CardTitle>
    </CardHeader>
    
    <CardContent>
      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
      />

      {/* Форма загрузки (показывается после выбора файла) */}
      {showDocumentUpload && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-medium mb-3">Upload Document</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Document Name</Label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Comment (Optional)</Label>
              <Textarea
                value={documentComment}
                onChange={(e) => setDocumentComment(e.target.value)}
                placeholder="Add a comment about this document..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDocumentUpload}
                size="sm"
                disabled={!documentName.trim()}
              >
                Upload
              </Button>
              <Button 
                onClick={() => {
                  setShowDocumentUpload(false);
                  setDocumentName('');
                  setDocumentComment('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Список документов */}
      {documentsLoading ? (
        <div className="text-center py-8 text-gray-500">
          Loading documents...
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => {
            const FileIcon = getFileIcon(document.file_type);
            return (
              <div 
                key={document.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Иконка файла */}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  {/* Информация о документе */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {document.name}
                    </div>
                    {document.comment && (
                      <div className="text-sm text-gray-600 truncate">
                        {document.comment}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{document.file_size}</span>
                      <span>•</span>
                      <span>Uploaded by {document.created_by_name}</span>
                      <span>•</span>
                      <span>{formatDocumentTimestamp(document.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Скачать */}
                  {document.file_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {/* Удалить */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDocument(document.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-500 mb-4">
            Upload documents related to this lead
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload First Document
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
```

---

## Шаг 5: Структура хранения файлов

### 5.1 Организация папок в Storage

```
crm.gbs/
└── documents/
    ├── company-name-1/
    │   ├── 2024-11-25T10-30-00-000Z-contract.pdf
    │   ├── 2024-11-25T11-15-00-000Z-invoice.xlsx
    │   └── 2024-11-25T14-20-00-000Z-presentation.pptx
    ├── company-name-2/
    │   └── 2024-11-25T09-00-00-000Z-proposal.pdf
    └── john-doe/
        └── 2024-11-25T16-45-00-000Z-resume.pdf
```

### 5.2 Формат имени файла

```
{timestamp}-{sanitized_document_name}.{extension}

Пример:
2024-11-25T10-30-00-000Z-contract_v2.pdf
```

---

## Шаг 6: Типичные проблемы и решения

### Проблема 1: Ошибка "Policy violation"

**Причина**: Неправильно настроены RLS политики

**Решение**:
```sql
-- Проверьте, что RLS включен
ALTER TABLE crm_gbs_documents ENABLE ROW LEVEL SECURITY;

-- Добавьте политики для authenticated пользователей
CREATE POLICY "Allow all for authenticated users"
ON crm_gbs_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### Проблема 2: Файл загружается, но не отображается

**Причина**: Bucket не публичный

**Решение**: В Supabase Dashboard → Storage → Settings → сделайте bucket публичным

### Проблема 3: Ошибка при удалении файла

**Причина**: Файл уже удален из Storage, но запись осталась в БД

**Решение**: В функции `deleteDocument` продолжайте удаление из БД даже если Storage вернул ошибку (уже реализовано в коде выше)

### Проблема 4: Не работает загрузка больших файлов

**Причина**: Ограничение размера файла в Supabase (по умолчанию 50MB)

**Решение**: 
- Для Free tier: максимум 50MB
- Для Pro tier: можно увеличить до 5GB
- Добавьте проверку размера на клиенте:

```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Проверка размера (50MB = 52428800 bytes)
    if (file.size > 52428800) {
      toast.error('File is too large. Maximum size is 50MB');
      return;
    }
    setDocumentName(file.name);
    setShowDocumentUpload(true);
  }
};
```

---

## Шаг 7: Дополнительные возможности

### 7.1 Предпросмотр изображений

```typescript
const handlePreviewImage = (document: Document) => {
  if (document.file_type.startsWith('image/')) {
    // Открыть в модальном окне или новой вкладке
    window.open(document.file_url, '_blank');
  }
};
```

### 7.2 Фильтрация по типу файла

```typescript
const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');

const filteredDocuments = documents.filter(doc => {
  if (fileTypeFilter === 'all') return true;
  if (fileTypeFilter === 'images') return doc.file_type.startsWith('image/');
  if (fileTypeFilter === 'documents') return doc.file_type.includes('pdf') || doc.file_type.includes('word');
  return true;
});
```

### 7.3 Поиск по документам

```typescript
const [searchQuery, setSearchQuery] = useState('');

const searchedDocuments = documents.filter(doc => 
  doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  doc.comment?.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 7.4 Массовая загрузка

```typescript
const handleMultipleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  
  // Загружаем все файлы параллельно
  Promise.all(
    files.map(file => 
      uploadDocument({
        name: file.name,
        file: file,
        entity_type: 'lead',
        entity_id: lead.id
      })
    )
  ).then(results => {
    const errors = results.filter(r => r.error);
    if (errors.length === 0) {
      toast.success(`${files.length} documents uploaded successfully!`);
    } else {
      toast.error(`${errors.length} documents failed to upload`);
    }
  });
};
```

---

## Шаг 8: Checklist для внедрения

- [ ] Создан Storage Bucket `crm.gbs` в Supabase
- [ ] Настроены RLS политики для Storage
- [ ] Создана таблица `crm_gbs_documents`
- [ ] Настроены RLS политики для таблицы
- [ ] Предоставлены права (GRANT) для authenticated/anon
- [ ] Создан файл `src/hooks/useDocuments.ts`
- [ ] Хук интегрирован в компонент
- [ ] Добавлены обработчики событий
- [ ] Реализован UI для загрузки/отображения/удаления
- [ ] Добавлены toast-уведомления
- [ ] Протестирована загрузка файлов
- [ ] Протестировано удаление файлов
- [ ] Проверена работа с разными типами файлов

---

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи в консоли браузера
2. Проверьте логи в Supabase Dashboard → Database → Logs
3. Проверьте Storage → Logs для ошибок загрузки
4. Убедитесь, что все политики RLS настроены корректно

---

**Версия документации**: 1.0  
**Дата создания**: 25 ноября 2024  
**Проект**: gbs CRM

