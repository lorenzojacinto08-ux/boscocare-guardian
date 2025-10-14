import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StudentRecord {
  id: string;
  student_id: string;
  name: string;
  gender?: string;
  date_of_birth?: string;
  year_level: string;
  section_program?: string;
  address?: string;
  phone_number?: string;
  email_address?: string;
  parent_guardian_name?: string;
  parent_contact_number?: string;
  parent_relationship?: string;
  current_status: string;
  subjects_courses?: string;
  average_grade?: number;
  education_level: string;
}

const StudentRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Elementary");
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    gender: "",
    date_of_birth: "",
    year_level: "",
    section_program: "",
    address: "",
    phone_number: "",
    email_address: "",
    parent_guardian_name: "",
    parent_contact_number: "",
    parent_relationship: "",
    current_status: "Active",
    subjects_courses: "",
    average_grade: "",
    education_level: "Elementary",
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

    const recordData = {
      student_id: formData.student_id,
      name: formData.name,
      gender: formData.gender || null,
      date_of_birth: formData.date_of_birth || null,
      year_level: formData.year_level,
      section_program: formData.section_program || null,
      address: formData.address || null,
      phone_number: formData.phone_number || null,
      email_address: formData.email_address || null,
      parent_guardian_name: formData.parent_guardian_name || null,
      parent_contact_number: formData.parent_contact_number || null,
      parent_relationship: formData.parent_relationship || null,
      current_status: formData.current_status,
      subjects_courses: formData.subjects_courses || null,
      average_grade: formData.average_grade ? parseFloat(formData.average_grade) : null,
      education_level: formData.education_level,
    };

    if (editingRecord) {
      const { error } = await supabase
        .from('student_records')
        .update(recordData)
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
        .insert([{ ...recordData, created_by: user.id }]);

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
      gender: record.gender || "",
      date_of_birth: record.date_of_birth || "",
      year_level: record.year_level,
      section_program: record.section_program || "",
      address: record.address || "",
      phone_number: record.phone_number || "",
      email_address: record.email_address || "",
      parent_guardian_name: record.parent_guardian_name || "",
      parent_contact_number: record.parent_contact_number || "",
      parent_relationship: record.parent_relationship || "",
      current_status: record.current_status,
      subjects_courses: record.subjects_courses || "",
      average_grade: record.average_grade?.toString() || "",
      education_level: record.education_level,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      student_id: "",
      name: "",
      gender: "",
      date_of_birth: "",
      year_level: "",
      section_program: "",
      address: "",
      phone_number: "",
      email_address: "",
      parent_guardian_name: "",
      parent_contact_number: "",
      parent_relationship: "",
      current_status: "Active",
      subjects_courses: "",
      average_grade: "",
      education_level: activeTab,
    });
  };

  const filteredRecords = records.filter(
    (record) => record.education_level === activeTab
  );

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
              <Button onClick={() => { setFormData({ ...formData, education_level: activeTab }); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="Elementary">Elementary</TabsTrigger>
                  <TabsTrigger value="High School">High School</TabsTrigger>
                  <TabsTrigger value="Senior High">Senior High</TabsTrigger>
                  <TabsTrigger value="College">College</TabsTrigger>
                </TabsList>

                {["Elementary", "High School", "Senior High", "College"].map((level) => (
                  <TabsContent key={level} value={level} className="mt-0">
                    {loading ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : filteredRecords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No {level} student records found. Click "Add Student" to create one.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Year Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{record.student_id}</TableCell>
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.gender || "N/A"}</TableCell>
                              <TableCell>{record.year_level}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  record.current_status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  record.current_status === 'Transferred' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {record.current_status}
                                </span>
                              </TableCell>
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
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Student Record" : "Add New Student Record"}</DialogTitle>
            <DialogDescription>
              {editingRecord ? "Update the student information below" : "Fill in the student information below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID / Number *</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_level">Grade / Year Level *</Label>
                  <Input
                    id="year_level"
                    value={formData.year_level}
                    onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section_program">Section / Program</Label>
                  <Input
                    id="section_program"
                    value={formData.section_program}
                    onChange={(e) => setFormData({ ...formData, section_program: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address</Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Guardian / Parent Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_guardian_name">Parent/Guardian Name</Label>
                  <Input
                    id="parent_guardian_name"
                    value={formData.parent_guardian_name}
                    onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_contact_number">Contact Number</Label>
                  <Input
                    id="parent_contact_number"
                    type="tel"
                    value={formData.parent_contact_number}
                    onChange={(e) => setFormData({ ...formData, parent_contact_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_relationship">Relationship</Label>
                  <Input
                    id="parent_relationship"
                    value={formData.parent_relationship}
                    onChange={(e) => setFormData({ ...formData, parent_relationship: e.target.value })}
                    placeholder="e.g., Mother, Father, Guardian"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Academic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_status">Current Status *</Label>
                  <Select value={formData.current_status} onValueChange={(value) => setFormData({ ...formData, current_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Transferred">Transferred</SelectItem>
                      <SelectItem value="Graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="average_grade">Average Grade (Optional)</Label>
                  <Input
                    id="average_grade"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.average_grade}
                    onChange={(e) => setFormData({ ...formData, average_grade: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="subjects_courses">Subjects / Courses Enrolled</Label>
                  <Textarea
                    id="subjects_courses"
                    value={formData.subjects_courses}
                    onChange={(e) => setFormData({ ...formData, subjects_courses: e.target.value })}
                    rows={3}
                    placeholder="Enter subjects/courses separated by commas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Education Level *</Label>
                  <Select value={formData.education_level} onValueChange={(value) => setFormData({ ...formData, education_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elementary">Elementary</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Senior High">Senior High</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingRecord ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
};

export default StudentRecords;
