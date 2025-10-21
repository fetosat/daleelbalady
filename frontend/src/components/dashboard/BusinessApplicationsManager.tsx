import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Eye, Download, CheckCircle, XCircle, Clock, AlertTriangle,
  Filter, Search, Calendar, User, Building, Phone, Mail,
  FileText, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/utils/apiClient';

interface BusinessApplication {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  description?: string;
  businessAddress?: string;
  businessCity?: string;
  businessType: 'PROVIDER' | 'DELIVERY';
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_DOCUMENTS';
  statusNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  documents: BusinessDocument[];
}

interface BusinessDocument {
  id: string;
  documentType: string;
  originalName: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  isVerified: boolean;
  uploadedAt: string;
}

const BusinessApplicationsManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<BusinessApplication | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<BusinessApplication['status'] | ''>('');
  const [statusNotes, setStatusNotes] = useState('');

  const statusConfig = {
    PENDING: { icon: Clock, color: 'bg-yellow-500', label: 'Pending' },
    UNDER_REVIEW: { icon: Eye, color: 'bg-blue-500', label: 'Under Review' },
    APPROVED: { icon: CheckCircle, color: 'bg-green-500', label: 'Approved' },
    REJECTED: { icon: XCircle, color: 'bg-red-500', label: 'Rejected' },
    REQUIRES_DOCUMENTS: { icon: AlertTriangle, color: 'bg-orange-500', label: 'Requires Documents' },
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, typeFilter]);

  const fetchApplications = async () => {
    try {
      const response = await apiFetch('/business/admin/applications');
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.businessEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(app => app.businessType === typeFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes: string) => {
    setUpdatingStatus(true);
    try {
      const response = await apiFetch(`/business/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          statusNotes: notes
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Application ${status.toLowerCase()} successfully`,
        });
        await fetchApplications(); // Refresh the list
        setSelectedApplication(null); // Close dialog
      } else {
        const errorData = await response.json();
        throw new Error((errorData as any).error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await apiFetch(`/business/documents/${documentId}/download`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-primary mx-auto mb-4"></div>
          <p>Loading business applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Business Applications</h1>
          <p className="text-text-secondary">Manage and review partner applications</p>
        </div>
        <div className="text-sm text-text-secondary">
          {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  placeholder="Search by business name, email, or applicant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="REQUIRES_DOCUMENTS">Requires Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="PROVIDER">Service Provider</SelectItem>
                  <SelectItem value="DELIVERY">Delivery Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">No applications found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => {
            const StatusIcon = statusConfig[application.status].icon;
            
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {application.businessName}
                          </h3>
                          <Badge
                            className={`${statusConfig[application.status].color} text-white`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[application.status].label}
                          </Badge>
                          <Badge variant="outline">
                            {application.businessType}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-text-muted" />
                            <span>{application.applicant.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-text-muted" />
                            <span>{application.businessEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-text-muted" />
                            <span>{application.businessPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-text-muted" />
                            <span>{formatDate(application.submittedAt)}</span>
                          </div>
                        </div>
                        
                        {application.businessAddress && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-text-muted" />
                            <span>{application.businessAddress}, {application.businessCity}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            {selectedApplication && (
                              <ApplicationReviewDialog
                                application={selectedApplication}
                                onStatusUpdate={updateApplicationStatus}
                                onDocumentDownload={downloadDocument}
                                updatingStatus={updatingStatus}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Application Review Dialog Component
const ApplicationReviewDialog = ({ 
  application, 
  onStatusUpdate, 
  onDocumentDownload, 
  updatingStatus 
}: {
  application: BusinessApplication;
  onStatusUpdate: (id: string, status: string, notes: string) => Promise<void>;
  onDocumentDownload: (documentId: string, filename: string) => Promise<void>;
  updatingStatus: boolean;
}) => {
  const [newStatus, setNewStatus] = useState(application.status);
  const [statusNotes, setStatusNotes] = useState(application.statusNotes || '');

  const handleStatusUpdate = () => {
    onStatusUpdate(application.id, newStatus, statusNotes);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review Business Application</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="status">Update Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-medium">Business Name</Label>
              <p className="text-sm">{application.businessName}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Business Type</Label>
              <p className="text-sm">{application.businessType}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Business Email</Label>
              <p className="text-sm">{application.businessEmail}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Business Phone</Label>
              <p className="text-sm">{application.businessPhone}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Applicant Name</Label>
              <p className="text-sm">{application.applicant.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Applicant Email</Label>
              <p className="text-sm">{application.applicant.email}</p>
            </div>
          </div>
          
          {application.description && (
            <div className="space-y-2">
              <Label className="font-medium">Business Description</Label>
              <p className="text-sm">{application.description}</p>
            </div>
          )}
          
          {application.businessAddress && (
            <div className="space-y-2">
              <Label className="font-medium">Business Address</Label>
              <p className="text-sm">{application.businessAddress}, {application.businessCity}</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          {application.documents.length === 0 ? (
            <p className="text-sm text-text-secondary">No documents uploaded</p>
          ) : (
            <div className="space-y-3">
              {application.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-primary" />
                    <div>
                      <p className="font-medium">{doc.originalName}</p>
                      <p className="text-xs text-text-muted">
                        {doc.documentType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDocumentDownload(doc.id, doc.originalName)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <p className="text-sm text-text-secondary">{application.status}</p>
            </div>
            
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BusinessApplication['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="REQUIRES_DOCUMENTS">Requires Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status Notes</Label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={3}
              />
            </div>
            
            <Button
              onClick={handleStatusUpdate}
              disabled={updatingStatus || newStatus === application.status}
              className="w-full"
            >
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default BusinessApplicationsManager;
