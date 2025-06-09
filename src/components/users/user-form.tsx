
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSchema, type User, UserRoleSchema } from "@/lib/schemas/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

interface UserFormProps {
  onSubmit: (data: User) => Promise<void>;
  defaultValues?: Partial<User>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, defaultValues, isEditing = false, isLoading = false }: UserFormProps) {
  const form = useForm<User>({
    resolver: zodResolver(UserSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      role: "user", // Default role for new users
      password: "",
      confirmPassword: "",
    },
  });

  const handleFormSubmit = async (data: User) => {
    await onSubmit(data);
    // Reset form only if it's for adding and not currently loading
    // For editing, we typically keep the form filled.
    if (!isEditing && !isLoading) {
        form.reset({ name: "", email: "", role: "user", password: "", confirmPassword: "" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="usuario@exemplo.com" {...field} disabled={isEditing} />
              </FormControl>
              {isEditing && <FormDescription className="text-xs">O e-mail não pode ser alterado após o cadastro.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password fields are shown if NOT editing OR if it's the registration form (which is also !isEditing) */}
        {!isEditing && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Repita a senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {/* Role field is always shown, but could be disabled for non-admins if UserForm is used by users to edit their own profile */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                // Disable role change if 'isEditing' and not admin, or if it's self-registration form (non-admin)
                // For simplicity, assuming admin role allows changing roles during edit, 
                // and self-registration always defaults to 'user' (UserForm doesn't expose role field for self-reg)
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UserRoleSchema.options.map(roleValue => (
                    <SelectItem key={roleValue} value={roleValue}>
                      {roleValue === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Cadastrar Usuário"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
