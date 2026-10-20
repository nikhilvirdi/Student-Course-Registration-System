import { useState, useEffect } from 'react';
import { Folder, FileText, User, Calendar, Download, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiFetch, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';

export default function AdminDocumentsPage() {
  const { token, user } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchDocuments();
    }
  }, [token, user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/documents', { token });
      if (res.success) setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    const downloadUrl = `http://localhost:5000/api/documents/${doc.document_id}/download`;
    window.open(downloadUrl, '_blank');
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Are you sure you want to delete ${doc.name}?`)) return;
    try {
      await apiFetch(`/documents/${doc.document_id}`, { method: 'DELETE', token });
      await fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-red-500 font-bold text-center">Access Denied. Admins only.</div>;
  }

  const filteredDocuments = documents.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.type?.toLowerCase().includes(q) ||
      d.student?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Folder}
        title="Documents Oversight"
        description="View and manage all student-uploaded documents across the platform."
      />

      <div className="bg-card border border-card-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by document name, type, or student..."
          className="w-full sm:w-96"
        />
        <div className="text-sm text-sidebar-fg">
          <span className="font-bold text-foreground">{filteredDocuments.length}</span> documents
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sidebar-accent/50 text-sidebar-fg">
              <tr>
                <th className="p-4 font-medium">Document</th>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Uploaded</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-sidebar-fg">Loading documents...</td></tr>
              ) : filteredDocuments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-sidebar-fg">No documents found.</td></tr>
              ) : filteredDocuments.map((doc) => (
                <tr key={doc.document_id} className="hover:bg-sidebar-accent/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sidebar-accent rounded-lg">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{doc.name}</p>
                        <span className="text-xs text-sidebar-fg">Stored file</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-sidebar-fg" />
                      <span className="text-foreground font-medium">{doc.student?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-sidebar-accent rounded-md text-xs font-medium text-sidebar-fg">
                      {doc.type}
                    </span>
                  </td>
                  <td className="p-4 text-sidebar-fg text-xs">{doc.size}</td>
                  <td className="p-4 text-sidebar-fg text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.uploaded_at)}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-sidebar-fg hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 text-sidebar-fg hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}
