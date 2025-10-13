import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { SacramentDocument } from "@/types/tables";

const SacramentDocuments = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<SacramentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SacramentDocument | null>(
    null
  );
  const [formData, setFormData] = useState({
    student_name: "",
    sacrament_type: "",
    document_date: "",
    document_number: "",
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("sacrament_documents")
      .select("*")
      .order("document_date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch sacrament documents");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editingRecord) {
      const { error } = await supabase
        .from("sacrament_documents")
        .update(formData)
        .eq("id", editingRecord.id);

      if (error) {
        toast.error("Failed to update document");
      } else {
        toast.success("Document updated successfully");
        fetchRecords();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from("sacrament_documents")
        .insert({ ...formData, created_by: user.id });

      if (error) {
        toast.error("Failed to create document");
      } else {
        toast.success("Document created successfully");
        fetchRecords();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase
      .from("sacrament_documents")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete document");
    } else {
      toast.success("Document deleted successfully");
      fetchRecords();
    }
  };

  const handleEdit = (record: SacramentDocument) => {
    setEditingRecord(record);
    setFormData({
      student_name: record.student_id,
      sacrament_type: record.sacrament_type,
      document_date: record.document_date.slice(0, 16),
      document_number: record.document_number || "",
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      student_name: "",
      sacrament_type: "",
      document_date: "",
      document_number: "",
      notes: "",
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate("/pastoral")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pastoral
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-[var(--shadow-card-hover)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sacrament Documents
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecord ? "Edit" : "Add"} Sacrament Document
                    </DialogTitle>
                    <DialogDescription>
                      {editingRecord ? "Update" : "Create a new"} sacrament
                      document record
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="student_name">Student Name</Label>
                        <Input
                          id="student_name"
                          value={formData.student_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              student_name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sacrament_type">Sacrament Type</Label>
                        <Input
                          id="sacrament_type"
                          value={formData.sacrament_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sacrament_type: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="document_date">Document Date</Label>
                        <Input
                          id="document_date"
                          type="datetime-local"
                          value={formData.document_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              document_date: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="document_number">Document Number</Label>
                        <Input
                          id="document_number"
                          value={formData.document_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              document_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingRecord ? "Update" : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sacrament documents found. Add your first document!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Sacrament Type</TableHead>
                      <TableHead>Document Date</TableHead>
                      <TableHead>Document #</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.student_id}
                        </TableCell>
                        <TableCell>{record.sacrament_type}</TableCell>
                        <TableCell>
                          {format(new Date(record.document_date), "PPp")}
                        </TableCell>
                        <TableCell>{record.document_number || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEdit(record)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default SacramentDocuments;
