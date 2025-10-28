import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Client } from "../types";
import { Edit, User, Building2, Mail, Phone } from "lucide-react";

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onUpdateClient: (clientId: string, updates: Partial<Omit<Client, "id" | "createdAt">>) => void;
}

export function EditClientModal({ open, onOpenChange, client, onUpdateClient }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    businessName: "",
    creditScore: "",
    industry: "",
    dateOrganized: "",
    estimatedYearlyRevenue: "",
    estimatedMonthlyRevenue: "",
    projectType: "",
    budget: "",
    budgetPurpose: "",
    leadSource: "",
    descriptionNotes: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        phone: client.phone || "",
        email: client.email || "",
        businessName: client.businessName || "",
        creditScore: client.creditScore || "",
        industry: client.industry || "",
        dateOrganized: client.dateOrganized || "",
        estimatedYearlyRevenue: client.estimatedYearlyRevenue || "",
        estimatedMonthlyRevenue: client.estimatedMonthlyRevenue || "",
        projectType: client.projectType || "",
        budget: client.budget || "",
        budgetPurpose: client.budgetPurpose || "",
        leadSource: client.leadSource || "",
        descriptionNotes: client.descriptionNotes || "",
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onUpdateClient(client.id, formData);
      onOpenChange(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1400px] w-[95vw] max-h-[90vh] overflow-y-auto border border-gray-200 bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2.5 text-gray-900">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <span>Edit Client</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm ml-11">
            Update client information below
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm text-gray-700">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-sm text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="creditScore" className="text-sm text-gray-700">Credit Score <span className="text-red-500">*</span></Label>
                    <Input
                      id="creditScore"
                      placeholder="750"
                      value={formData.creditScore}
                      onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                      required
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Company Information
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-sm text-gray-700">Business Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="businessName"
                      placeholder="Company LLC"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-sm text-gray-700">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="Technology, Retail, Manufacturing, etc."
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dateOrganized" className="text-sm text-gray-700">Date Organized</Label>
                    <Input
                      id="dateOrganized"
                      type="date"
                      value={formData.dateOrganized}
                      onChange={(e) => setFormData({ ...formData, dateOrganized: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="estimatedYearlyRevenue" className="text-sm text-gray-700">Yearly Revenue</Label>
                      <Input
                        id="estimatedYearlyRevenue"
                        placeholder="$1,000,000"
                        value={formData.estimatedYearlyRevenue}
                        onChange={(e) => setFormData({ ...formData, estimatedYearlyRevenue: e.target.value })}
                        className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="estimatedMonthlyRevenue" className="text-sm text-gray-700">Monthly Revenue</Label>
                      <Input
                        id="estimatedMonthlyRevenue"
                        placeholder="$83,333"
                        value={formData.estimatedMonthlyRevenue}
                        onChange={(e) => setFormData({ ...formData, estimatedMonthlyRevenue: e.target.value })}
                        className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Project Information */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Contact Details
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm text-gray-700">Email <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="client@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="pl-9 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="leadSource" className="text-sm text-gray-700">Lead Source</Label>
                    <Input
                      id="leadSource"
                      placeholder="Website, Referral, Social Media, etc."
                      value={formData.leadSource}
                      onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Project Details
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectType" className="text-sm text-gray-700">Project Type</Label>
                    <Input
                      id="projectType"
                      placeholder="Web Development, Consulting, etc."
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="budget" className="text-sm text-gray-700">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="$50,000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="budgetPurpose" className="text-sm text-gray-700">Budget Purpose</Label>
                    <Input
                      id="budgetPurpose"
                      placeholder="Website redesign, mobile app, etc."
                      value={formData.budgetPurpose}
                      onChange={(e) => setFormData({ ...formData, budgetPurpose: e.target.value })}
                      className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Additional Notes
                </h3>
                
                <div className="space-y-1.5">
                  <Textarea
                    id="descriptionNotes"
                    placeholder="Any additional information about the client..."
                    value={formData.descriptionNotes}
                    onChange={(e) => setFormData({ ...formData, descriptionNotes: e.target.value })}
                    rows={4}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-6 mt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 h-9 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-colors h-9 px-6"
            >
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

