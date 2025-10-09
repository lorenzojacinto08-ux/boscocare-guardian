import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentRecord {
  id: string;
  student_id: string;
  name: string;
  address: string;
  year_level: string;
}

const StudentRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentRecord | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    address: "",
    year_level: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('student_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch student records");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingRecord) {
      const { error } = await supabase
        .from('student_records')
        .update(formData)
        .eq('id', editingRecord.id);

      if (error) {
        toast.error("Failed to update record");
      } else {
        toast.success("Record updated successfully");
        fetchRecords();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from('student_records')
        .insert({ ...formData, created_by: user.id });

      if (error) {
        toast.error("Failed to create record");
      } else {
        toast.success("Record created successfully");
        fetchRecords();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const { error } = await supabase
      .from('student_records')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete record");
    } else {
      toast.success("Record deleted successfully");
      fetchRecords();
    }
  };

  const handleEdit = (record: StudentRecord) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id,
      name: record.name,
      address: record.address || "",
      year_level: record.year_level,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      student_id: "",
      name: "",
      address: "",
      year_level: "",
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-[var(--shadow-card-hover)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Student Records
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingRecord ? "Edit" : "Add"} Student Record</DialogTitle>
                    <DialogDescription>
                      {editingRecord ? "Update" : "Create a new"} student record
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year_level">Year Level</Label>
                      <Input
                        id="year_level"
                        value={formData.year_level}
                        onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingRecord ? "Update" : "Create"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
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
                  No student records found. Add your first student!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Year Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.student_id}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.address || "-"}</TableCell>
                        <TableCell>{record.year_level}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEdit(record)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(record.id)}>
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

export default StudentRecords;
