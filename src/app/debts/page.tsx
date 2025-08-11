'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Debt {
  id: number;
  mes: number;
  gestion: number;
  monto: number;
  fecha: string;
  observaciones: string;
  consumo: number;
  mesNombre: string;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedDebts, setSelectedDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingQR, setGeneratingQR] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const response = await fetch('/api/debts');
      const data = await response.json();

      if (data.success) {
        setDebts(data.debts);
      } else {
        if (response.status === 401) {
          router.push('/');
        } else {
          setError(data.error || 'Error cargando deudas');
        }
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDebtSelection = (debt: Debt, checked: boolean) => {
    if (checked) {
      setSelectedDebts([...selectedDebts, debt]);
    } else {
      setSelectedDebts(selectedDebts.filter(d => d.id !== debt.id));
    }
  };

  const handleSelectAll = () => {
    if (selectedDebts.length === debts.length) {
      setSelectedDebts([]);
    } else {
      setSelectedDebts([...debts]);
    }
  };

  const getTotalAmount = () => {
    return selectedDebts.reduce((sum, debt) => sum + debt.monto, 0);
  };

  const generateQR = async () => {
    if (selectedDebts.length === 0) {
      setError('Seleccione al menos una deuda para pagar');
      return;
    }

    setGeneratingQR(true);
    try {
      const response = await fetch('/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedDebts,
          totalAmount: getTotalAmount()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirigir a la página de QR con los datos
        localStorage.setItem('qrData', JSON.stringify(data));
        router.push('/payment');
      } else {
        setError(data.error || 'Error generando QR');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setGeneratingQR(false);
    }
  };

  const logout = () => {
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando deudas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Deudas</h1>
          <Button variant="outline" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {debts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 text-lg">¡No tienes deudas pendientes!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Deudas Pendientes ({debts.length})</CardTitle>
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="text-sm"
                  >
                    {selectedDebts.length === debts.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {debts.map((debt) => (
                  <div key={debt.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedDebts.some(d => d.id === debt.id)}
                      onCheckedChange={(checked) => handleDebtSelection(debt, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {debt.mesNombre} {debt.gestion}
                          </h3>
                          <p className="text-gray-600">
                            Consumo: {debt.consumo} m³
                          </p>
                          {debt.observaciones && (
                            <p className="text-sm text-gray-500 mt-1">
                              {debt.observaciones}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="text-lg px-3 py-1">
                            Bs. {debt.monto.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedDebts.length > 0 && (
              <Card className="sticky bottom-4 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedDebts.length} deuda{selectedDebts.length > 1 ? 's' : ''} seleccionada{selectedDebts.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Total: Bs. {getTotalAmount().toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={generateQR}
                      disabled={generatingQR}
                      size="lg"
                      className="px-8"
                    >
                      {generatingQR ? 'Generando...' : 'Generar QR de Pago'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
