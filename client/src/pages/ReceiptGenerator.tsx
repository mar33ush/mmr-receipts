import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function ReceiptGenerator() {
  const [formData, setFormData] = useState({
    fromText: "",
    toText: "",
    toNumber: "",
    purpose: "",
    date: new Date().toLocaleDateString("ar-SA"),
    price: "",
  });

  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const generateMutation = trpc.receipt.generate.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await generateMutation.mutateAsync(formData);
      if (result.success && result.html) {
        setGeneratedHtml(result.html);
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
    }
  };

  const handlePrint = () => {
    if (generatedHtml) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(generatedHtml);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    if (generatedHtml) {
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/html;charset=utf-8," + encodeURIComponent(generatedHtml));
      element.setAttribute("download", `receipt-${Date.now()}.html`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-2xl">إنشاء إيصال التحويل</CardTitle>
              <CardDescription>أدخل بيانات التحويل لإنشاء إيصال احترافي</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">من (المرسل)</label>
                  <Input
                    type="text"
                    name="fromText"
                    value={formData.fromText}
                    onChange={handleInputChange}
                    placeholder="اسم المرسل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">إلى (المستقبل)</label>
                  <Input
                    type="text"
                    name="toText"
                    value={formData.toText}
                    onChange={handleInputChange}
                    placeholder="اسم المستقبل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">رقم الحساب</label>
                  <Input
                    type="text"
                    name="toNumber"
                    value={formData.toNumber}
                    onChange={handleInputChange}
                    placeholder="رقم الحساب البنكي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">الغرض</label>
                  <Input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="غرض التحويل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المبلغ (SAR)</label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="المبلغ بالريال السعودي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">التاريخ</label>
                  <Input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="التاريخ"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    "إنشاء الإيصال"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <div>
            {generatedHtml ? (
              <Card>
                <CardHeader>
                  <CardTitle>معاينة الإيصال</CardTitle>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handlePrint}
                      variant="outline"
                      className="flex-1"
                    >
                      طباعة
                    </Button>
                    <Button 
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      تحميل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border rounded-lg p-4 bg-white overflow-auto max-h-96"
                    dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <p className="text-gray-500">سيظهر الإيصال هنا بعد الإنشاء</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
