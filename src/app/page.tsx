'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [codigoSocio, setCodigoSocio] = useState('');
  const [ci, setCi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigoSocio, ci }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/debts');
      } else {
        setError(data.error || 'Error en la autenticación');
      }
    } catch (error) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">COOSAPAC</CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de Consulta de Deudas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigoSocio">Código de Socio</Label>
              <Input
                id="codigoSocio"
                type="text"
                placeholder="Ingrese su código de socio"
                value={codigoSocio}
                onChange={(e) => setCodigoSocio(e.target.value)}
                required
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ci">Cédula de Identidad</Label>
              <Input
                id="ci"
                type="text"
                placeholder="Ingrese su CI"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                required
                className="text-lg"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full text-lg py-6"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
