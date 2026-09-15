import { useState } from 'react'
import { Plus, CreditCard, GitBranch, Calendar, Trash2, Edit, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardProps {
  onOpenCheckout: (id: string) => void
  onOpenFlow: (id: string) => void
}

export function Dashboard({ onOpenCheckout, onOpenFlow }: DashboardProps) {
  const { templates, createTemplate, deleteTemplate } = useCheckoutStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleCreate = () => {
    if (newName.trim()) {
      const id = createTemplate(newName, newDescription)
      setNewName('')
      setNewDescription('')
      setIsDialogOpen(false)
      onOpenCheckout(id)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b bg-card flex items-center px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold hidden sm:block">Checkout Builder</h1>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Checkout</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Checkout</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo checkout
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Meu Checkout"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição opcional"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum checkout criado</h2>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro checkout para começar
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Checkout
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      <span>{template.components.length} componentes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(template.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onOpenCheckout(template.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onOpenFlow(template.id)}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      Flow
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
