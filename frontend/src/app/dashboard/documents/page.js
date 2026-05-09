'use client';

import { File, Folder, Download, MoreVertical, UploadCloud, Search, Filter, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const folders = [
  { id: 1, name: 'CS302 Project', files: 12, size: '45 MB', modified: 'Yesterday' },
  { id: 2, name: 'Transcripts', files: 4, size: '2.4 MB', modified: 'May 01, 2026' },
  { id: 3, name: 'Study Materials', files: 28, size: '156 MB', modified: 'Apr 28, 2026' },
];

const documents = [
  { id: 1, name: 'DBMS_Final_Report_v2.pdf', type: 'pdf', size: '4.2 MB', modified: '2 hours ago', course: 'CS302' },
  { id: 2, name: 'Assignment_3_Questions.docx', type: 'doc', size: '1.1 MB', modified: 'Yesterday', course: 'CS301' },
  { id: 3, name: 'Data_Structures_Cheatsheet.png', type: 'image', size: '3.8 MB', modified: 'May 05, 2026', course: 'CS301' },
  { id: 4, name: 'Grade_Calculations.xlsx', type: 'sheet', size: '850 KB', modified: 'May 02, 2026', course: 'Personal' },
  { id: 5, name: 'Official_Transcript_2025.pdf', type: 'pdf', size: '2.1 MB', modified: 'Jan 15, 2026', course: 'Official' },
];

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

export default function DocumentsPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUpload = () => {
    setIsUploadModalOpen(false);
    toast({
      title: "File Uploaded",
      description: "Your document was uploaded successfully.",
      type: "success"
    });
  };
  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': return <ImageIcon className="w-8 h-8 text-purple-500" />;
      case 'sheet': return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      default: return <File className="w-8 h-8 text-sidebar-fg" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-sidebar-fg mt-1">Manage your academic files and submissions.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['Recent', 'My Files', 'Shared', 'Archived'].map((tab, i) => (
            <button 
              key={tab}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                i === 0 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-card text-sidebar-fg border-card-border hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-fg" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="pl-9 pr-4 py-2 bg-card border border-card-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 transition-all"
            />
          </div>
          <button className="p-2 bg-card border border-card-border rounded-lg text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-sm font-semibold text-sidebar-fg uppercase tracking-wider mb-4">Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div key={folder.id} className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-start gap-3">
              <Folder className="w-10 h-10 text-primary/80 group-hover:text-primary transition-colors flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{folder.name}</h3>
                <p className="text-xs text-sidebar-fg mt-1">{folder.files} files • {folder.size}</p>
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
        <h2 className="text-sm font-semibold text-sidebar-fg uppercase tracking-wider mb-4">Files</h2>
        <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-sidebar-fg bg-sidebar-accent/50 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Course / Tag</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-sidebar-accent/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-sidebar-accent text-sidebar-fg border border-card-border">
                        {doc.course}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sidebar-fg">{doc.size}</td>
                    <td className="px-4 py-3 text-sidebar-fg">{doc.modified}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-sidebar-fg hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-sidebar-fg hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors" title="More options">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
          <>
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-sidebar-fg hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upload
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-sidebar-accent/50">
          <UploadCloud className="w-10 h-10 text-primary/80 mb-4" />
          <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-sidebar-fg mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
        </div>
      </Modal>
    </div>
  );
}
