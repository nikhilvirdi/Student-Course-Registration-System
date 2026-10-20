import React, { useState, useRef } from 'react';
import { 
  File, 
  Download, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet,
  Trash2,
  Code,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import SearchInput from '@/components/ui/SearchInput';

export default function DocumentsPage() {
  const { documents, uploadDocument, deleteDocument } = useApp();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({ name: '', type: 'PDF' });
  const [uploading, setUploading] = useState(false);

  const tabs = [
    { id: 'All', label: 'All Files' },
    { id: 'PDF', label: 'PDFs' },
    { id: 'Document', label: 'Docs' },
    { id: 'Image', label: 'Images' },
    { id: 'Other', label: 'Other' },
  ];

  const filteredDocuments = documents.filter(doc => {
    if (activeTab !== 'All' && doc.type?.toUpperCase() !== activeTab.toUpperCase()) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    let inferredType = 'Other';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') inferredType = 'PDF';
    else if (['doc', 'docx'].includes(ext)) inferredType = 'Document';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) inferredType = 'Image';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) inferredType = 'Sheet';
    else if (['js', 'sql', 'py', 'java', 'html', 'css'].includes(ext)) inferredType = 'Code';

    setUploadForm({
      name: file.name,
      type: inferredType,
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !uploadForm.name.trim()) {
      toast({ title: 'Error', description: 'Please choose a file to upload', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('name', uploadForm.name.trim() || selectedFile?.name || 'Document');
      formData.append('type', uploadForm.type);

      await uploadDocument(formData);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadForm({ name: '', type: 'PDF' });
      toast({ title: 'Upload Complete', description: 'File uploaded and saved successfully', type: 'success' });
    } catch (err) {
      toast({ title: 'Upload Failed', description: err.message || 'Error uploading file', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc) => {
    const downloadUrl = `http://localhost:5000/api/documents/${doc.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Are you sure you want to delete ${doc.name}?`)) return;
    try {
      await deleteDocument(doc.id);
      toast({ title: 'File Deleted', description: `${doc.name} was removed`, type: 'success' });
    } catch (err) {
      toast({ title: 'Delete Failed', description: err.message || 'Failed to delete file', type: 'error' });
    }
  };

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': 
      case 'docx':
      case 'document': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': 
      case 'png':
      case 'jpg': return <ImageIcon className="w-8 h-8 text-purple-500" />;
      case 'sheet': 
      case 'xlsx': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'code':
      case 'sql': return <Code className="w-8 h-8 text-amber-500" />;
      default: return <File className="w-8 h-8 text-sidebar-fg" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={File}
        title="Documents & Workspace"
        description="Upload course assignments, view resources, and download documents."
        action={
          <button 
            onClick={() => {
              setSelectedFile(null);
              setUploadForm({ name: '', type: 'PDF' });
              setIsUploadModalOpen(true);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Upload File
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <FilterTabs 
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
        
        <SearchInput 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by name..."
          className="w-full sm:w-64"
        />
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/50 text-sidebar-fg">
              <tr>
                <th className="p-4 font-medium">Document Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Date Uploaded</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-sidebar-accent/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sidebar-accent rounded-lg shrink-0">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-md">{doc.name}</p>
                          <span className="text-xs text-sidebar-fg">Available for download</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-sidebar-accent rounded-md text-xs font-semibold text-sidebar-fg uppercase tracking-wide">
                        {doc.type}
                      </span>
                    </td>
                    <td className="p-4 text-sidebar-fg text-xs font-medium">{doc.size || 'N/A'}</td>
                    <td className="p-4 text-sidebar-fg text-xs">{doc.date || 'Recent'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-sidebar-fg hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc)}
                          className="p-2 text-sidebar-fg hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <File className="w-12 h-12 text-sidebar-fg/30 mb-3" />
                      <p className="text-foreground font-semibold">No documents found</p>
                      <p className="text-xs text-sidebar-fg mt-1">Upload course documents, assignments, or notes above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload File Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !uploading && setIsUploadModalOpen(false)}
        title="Upload Document"
        description="Select a local file to upload and save in SCRS."
        footer={
          <div className="flex gap-3">
            <button 
              disabled={uploading}
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-sidebar-fg hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              disabled={uploading}
              onClick={handleUploadSubmit}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-card-border rounded-2xl bg-sidebar-accent/20 hover:bg-sidebar-accent/40 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {selectedFile ? selectedFile.name : 'Click to select file from device'}
            </p>
            <p className="text-[11px] text-sidebar-fg mt-1 uppercase font-bold tracking-widest">
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change` : 'PDF, DOC, DOCX, IMG, XLSX (max. 25MB)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g., CS101_Midterm_Review.pdf"
              value={uploadForm.name}
              onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sidebar-fg uppercase tracking-wider mb-1.5">Document Category</label>
            <select
              value={uploadForm.type}
              onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-all"
            >
              {['PDF', 'Document', 'Sheet', 'Image', 'Code', 'Other'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
