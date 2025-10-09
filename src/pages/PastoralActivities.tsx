import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface PastoralActivity {
  id: string;
  title: string;
  description: string;
  activity_date: string;
  activity_type: string;
  participants_count: number;
}

const PastoralActivities = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PastoralActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PastoralActivity | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_date: "",
    activity_type: "",
    participants_count: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('pastoral_activities')
      .select('*')
      .order('activity_date', { ascending: false });

    if (error) {
      toast.error("Failed to fetch activities");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dataToSubmit = {
      ...formData,
      participants_count: parseInt(formData.participants_count) || null,
    };

    if (editingRecord) {
      const { error } = await supabase
        .from('pastoral_activities')
        .update(dataToSubmit)
        .eq('id', editingRecord.id);

      if (error) {
        toast.error("Failed to update activity");
      } else {
        toast.success("Activity updated successfully");
        fetchRecords();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from('pastoral_activities')
        .insert({ ...dataToSubmit, created_by: user.id });

      if (error) {
        toast.error("Failed to create activity");
      } else {
        toast.success("Activity created successfully");
        fetchRecords();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    const { error } = await supabase
      .from('pastoral_activities')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete activity");
    } else {
      toast.success("Activity deleted successfully");
      fetchRecords();
    }
  };

  const handleEdit = (record: PastoralActivity) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      activity_date: record.activity_date.slice(0, 16),
      activity_type: record.activity_type || "",
      participants_count: record.participants_count?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      title: "",
      description: "",
      activity_date: "",
      activity_type: "",
      participants_count: "",
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/pastoral')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pastoral
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-[var(--shadow-card-hover)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pastoral Activities
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingRecord ? "Edit" : "Add"} Pastoral Activity</DialogTitle>
                    <DialogDescription>
                      {editingRecord ? "Update" : "Create a new"} pastoral activity
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="activity_date">Activity Date & Time</Label>
                        <Input
                          id="activity_date"
                          type="datetime-local"
                          value={formData.activity_date}
                          onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="participants_count">Participants Count</Label>
                        <Input
                          id="participants_count"
                          type="number"
                          value={formData.participants_count}
                          onChange={(e) => setFormData({ ...formData, participants_count: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity_type">Activity Type</Label>
                      <Input
                        id="activity_type"
                        value={formData.activity_type}
                        onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
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
                  No activities found. Add your first activity!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Activity Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.title}</TableCell>
                        <TableCell>{format(new Date(record.activity_date), "PPp")}</TableCell>
                        <TableCell>{record.activity_type || "-"}</TableCell>
                        <TableCell>{record.participants_count || "-"}</TableCell>
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

export default PastoralActivities;
