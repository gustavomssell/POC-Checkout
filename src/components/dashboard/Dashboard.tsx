import { useState } from 'react'
import { Plus, CreditCard, GitBranch, Calendar, Trash2, Edit, Zap, Layers } from 'lucide-react'
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

  const resetForm = () => {
    setNewName('')
    setNewDescription('')
  }

  const handleOpenChange = (open: boolean) => {
    // Fechou sem criar: descarta o rascunho para não vazar na próxima abertura.
    if (!open) resetForm()
    setIsDialogOpen(open)
  }

  const handleCancel = () => {
    resetForm()
    setIsDialogOpen(false)
  }

  const handleCreate = () => {
    if (newName.trim()) {
      const id = createTemplate(newName, newDescription)
      resetForm()
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
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
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
                    className="bg-muted dark:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Descrição opcional"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-muted dark:bg-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCancel}>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center shadow-lg">
              <CreditCard className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum checkout criado</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Crie seu primeiro checkout para começar a vender online
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Criar Checkout
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-200 group cursor-pointer"
                onClick={() => onOpenCheckout(template.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground truncate">
                      {template.name}
                    </CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                  {template.description && (
                    <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>{template.components.length} componentes</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(template.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); onOpenCheckout(template.id) }}
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => { e.stopPropagation(); onOpenFlow(template.id) }}
                    >
                      <GitBranch className="w-4 h-4 mr-1.5" />
                      Flow
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive transition-colors"
                      onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id) }}
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
