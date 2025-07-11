/*
 * Adicionado um diálogo de confirmação para a exclusão de categorias.
 * - Utiliza o componente AlertDialog para alertar o usuário sobre a perda de dados.
 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Palette, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  color?: string;
}

const Settings = () => {
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      const userInfoString = localStorage.getItem("userInfo");
      if (!userInfoString) throw new Error("Usuário não autenticado.");
      const { token } = JSON.parse(userInfoString);
      const response = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao buscar categorias");
      const data = await response.json();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    try {
      const userInfoString = localStorage.getItem("userInfo");
      if (!userInfoString) throw new Error("Usuário não autenticado.");
      const { token } = JSON.parse(userInfoString);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!response.ok) throw new Error("Falha ao adicionar categoria.");
      toast.success("Categoria adicionada com sucesso!");
      setNewCategoryName("");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const userInfoString = localStorage.getItem("userInfo");
      if (!userInfoString) throw new Error("Usuário não autenticado.");
      const { token } = JSON.parse(userInfoString);
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Falha ao remover categoria.");
      toast.success("Categoria removida com sucesso!");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveGoal = async () => {
    try {
      const userInfoString = localStorage.getItem("userInfo");
      if (!userInfoString) throw new Error("Usuário não autenticado.");
      const { token } = JSON.parse(userInfoString);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ monthlyGoal: parseFloat(monthlyGoal) }),
      });
      if (!response.ok) throw new Error("Falha ao salvar a meta.");
      toast.success("Meta mensal salva com sucesso!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-card-foreground">
                  Avisos de Meta
                </div>
                <div className="text-sm text-muted-foreground">
                  Receber alertas quando se aproximar da meta
                </div>
              </div>
              <Button variant="outline" size="sm">
                Ativo
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-card-foreground">
                  Resumo Mensal
                </div>
                <div className="text-sm text-muted-foreground">
                  Relatório no final de cada mês
                </div>
              </div>
              <Button variant="outline" size="sm">
                Ativo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center justify-between">
              <div className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Categorias
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nova categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAddCategory}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || "#ccc" }}
                    />
                    <span className="font-medium text-card-foreground">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Você tem certeza absoluta?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todas as despesas
                            associadas a esta categoria serão permanentemente
                            excluídas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCategory(category._id)}
                          >
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Exportar Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Baixar relatórios dos seus gastos</Label>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Exportar CSV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Exportar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Sobre o App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão</span>
                <span className="font-medium text-card-foreground">
                  1.0.0
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Última atualização
                </span>
                <span className="font-medium text-card-foreground">
                  Dezembro 2024
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Verificar atualizações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;