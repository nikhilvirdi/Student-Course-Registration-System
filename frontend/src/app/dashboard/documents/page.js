'use client';

import { useState } from 'react';
import { 
  File, 
  Folder, 
  Download, 
  MoreVertical, 
  UploadCloud, 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  Code
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import FilterTabs from '@/components/ui/FilterTabs';
import SearchInput from '@/components/ui/SearchInput';

const folders = [
  { id: 1, name: 'CS301 Project', files: 12, size: '45 MB', modified: 'Yesterday' },
  { id: 2, name: 'Transcripts', files: 4, size: '2.4 MB', modified: 'May 01, 2026' },
  { id: 3, name: 'Study Materials', files: 28, size: '156 MB', modified: 'Apr 28, 2026' },
];

export default function DocumentsPage() {
  const { documents, uploadDocument, deleteDocument } = useApp();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('My Files');

  const tabs = [
    { id: 'Recent', label: 'Recent' },
    { id: 'My Files', label: 'My Files' },
    { id: 'Shared', label: 'Shared' },
    { id: 'Archived', label: 'Archived' },
  ];

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUpload = () => {
    // Simulate file selection
    const mockFile = {
      name: 'New_Submission.pdf',
      type: 'pdf',
      size: '1.2 MB',
      category: 'General'
    };
    
    uploadDocument(mockFile);
    setIsUploadModalOpen(false);
    toast({ title: 'Document uploaded successfully', type: 'success' });
  };

  const getFileIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': 
      case 'docx': return <FileText className="w-8 h-8 text-blue-500" />;
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
        title="Documents"
        description="Manage your academic files and submissions."
        action={
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Upload File
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <FilterTabs 
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="flex items-center gap-3">
          <SearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full sm:w-64"
          />
          <button className="p-2 bg-card border border-card-border rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-xs font-bold text-sidebar-fg uppercase tracking-widest mb-4 flex items-center gap-2">
          Folders
          <span className="h-px flex-1 bg-card-border" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <Folder className="w-10 h-10 text-primary/80 group-hover:text-primary transition-all group-hover:scale-110 flex-shrink-0" fill="currentColor" fillOpacity={0.1} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{folder.name}</h3>
                <p className="text-[11px] text-sidebar-fg mt-1 uppercase font-semibold">{folder.files} files • {folder.size}</p>
              </div>
              <button className="text-sidebar-fg hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Files List */}
      <div>
        <h2 className="text-xs font-bold text-sidebar-fg uppercase tracking-widest mb-4 flex items-center gap-2">
          Recent Files
          <span className="h-px flex-1 bg-card-border" />
        </h2>
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-sidebar-fg bg-sidebar-accent/30 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Modified</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-sidebar-accent/20 transition-all duration-200 group cursor-pointer relative">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="group-hover:scale-110 transition-transform duration-300">
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">{doc.name}</span>
                            <span className="text-[10px] text-sidebar-fg uppercase font-bold tracking-tighter">{doc.type} File</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-sidebar-accent text-sidebar-fg border border-card-border group-hover:border-primary/30 transition-colors">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sidebar-fg font-medium group-hover:text-foreground transition-colors">{doc.size}</td>
                      <td className="px-6 py-4 text-sidebar-fg font-medium group-hover:text-foreground transition-colors">{doc.modified || doc.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-sidebar-fg hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                              toast({ title: 'File deleted', type: 'success' });
                            }}
                            className="p-2 text-sidebar-fg hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <File className="w-10 h-10 text-sidebar-fg/40 mb-3" />
                        <p className="text-sidebar-fg font-medium">No documents found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        description="Select a file to upload to your workspace."
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-sidebar-fg hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
            >
              Upload
            </button>
          </div>
        }
      >
        <div 
          onClick={handleUpload}
          className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-card-border rounded-2xl bg-sidebar-accent/20 hover:bg-sidebar-accent/40 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Click to upload or drag and drop</p>
          <p className="text-[11px] text-sidebar-fg mt-2 uppercase font-bold tracking-widest">SVG, PNG, JPG or PDF (max. 10MB)</p>
        </div>
      </Modal>
    </div>
  );
}

