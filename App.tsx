import React, { useState, useCallback } from 'react';
import { FileText, Download, Wand2, Eraser, AlignLeft, SpellCheck, FileOutput, BookOpen } from 'lucide-react';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { processTextWithGemini } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';
import { generateEPUB } from './utils/epubGenerator';
import { AIActionType, ToastMessage } from './types';

function App() {
  const [text, setText] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja limpar todo o texto?')) {
      setText('');
      addToast('info', 'Texto limpo com sucesso.');
    }
  };

  const handleGeneratePDF = () => {
    if (!text.trim()) {
      addToast('error', 'O campo de texto está vazio. Digite algo para converter.');
      return;
    }
    try {
      generatePDF(text);
      addToast('success', 'PDF gerado e baixado com sucesso!');
    } catch (error) {
      console.error(error);
      addToast('error', 'Ocorreu um erro ao gerar o PDF.');
    }
  };

  const handleGenerateEPUB = async () => {
    if (!text.trim()) {
      addToast('error', 'O campo de texto está vazio. Digite algo para converter.');
      return;
    }
    try {
      await generateEPUB(text);
      addToast('success', 'ePub gerado e baixado com sucesso!');
    } catch (error) {
      console.error(error);
      addToast('error', 'Ocorreu um erro ao gerar o ePub.');
    }
  };

  const handleAIAction = async (action: AIActionType) => {
    if (!text.trim()) {
      addToast('error', 'Digite algum texto para a IA processar.');
      return;
    }

    setIsProcessingAI(true);
    const response = await processTextWithGemini(text, action);
    setIsProcessingAI(false);

    if (response.error) {
      addToast('error', response.error);
    } else {
      setText(response.text);
      addToast('success', 'Texto processado pela IA com sucesso!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Am<span className="text-brand-600">.pdf.ai</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">v1.1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">
          
          {/* Toolbar */}
          <div className="border-b border-slate-100 p-3 flex flex-wrap gap-2 items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <Button 
                variant="secondary" 
                onClick={() => handleAIAction(AIActionType.FIX_GRAMMAR)}
                isLoading={isProcessingAI}
                icon={<SpellCheck className="w-4 h-4 text-emerald-600" />}
                className="text-xs sm:text-sm whitespace-nowrap"
                title="Corrigir erros gramaticais"
              >
                Corrigir Gramática
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleAIAction(AIActionType.IMPROVE)}
                isLoading={isProcessingAI}
                icon={<Wand2 className="w-4 h-4 text-purple-600" />}
                className="text-xs sm:text-sm whitespace-nowrap"
                title="Melhorar estilo e clareza"
              >
                Melhorar Texto
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleAIAction(AIActionType.SUMMARIZE)}
                isLoading={isProcessingAI}
                icon={<AlignLeft className="w-4 h-4 text-orange-600" />}
                className="text-xs sm:text-sm whitespace-nowrap"
                title="Resumir conteúdo"
              >
                Resumir
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="ghost" 
                onClick={handleClear}
                disabled={!text}
                icon={<Eraser className="w-4 h-4" />}
                className="text-xs sm:text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                Limpar
              </Button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-grow relative bg-white">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Digite ou cole seu texto aqui para começar..."
              className="w-full h-full p-6 resize-none focus:outline-none bg-white text-black leading-relaxed text-base sm:text-lg placeholder:text-slate-400"
              spellCheck={false}
            />
            
            {/* Character Count */}
            <div className="absolute bottom-4 right-6 text-xs text-slate-500 bg-white/90 border border-slate-200 px-2 py-1 rounded backdrop-blur-sm">
              {text.length} caracteres
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-xs text-slate-400 hidden sm:block">
              {text.length > 0 ? 'Pronto para converter' : 'Aguardando texto...'}
             </div>
             <div className="flex w-full sm:w-auto gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleGenerateEPUB}
                  disabled={!text}
                  icon={<BookOpen className="w-5 h-5 text-slate-600" />}
                  className="flex-1 sm:flex-initial font-medium"
                >
                  Gerar ePub
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleGeneratePDF}
                  disabled={!text}
                  icon={<FileOutput className="w-5 h-5" />}
                  className="flex-1 sm:flex-initial font-semibold shadow-lg shadow-brand-500/20"
                >
                  Gerar PDF
                </Button>
             </div>
          </div>
        </div>

        {/* Features Info (Below fold) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mb-3 mx-auto md:mx-0">
              <Download className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Rápido e Local</h3>
            <p className="text-sm text-slate-500">A conversão para PDF e ePub é feita diretamente no seu navegador. Seus dados não saem do dispositivo ao gerar os arquivos.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto md:mx-0">
              <Wand2 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Potencializado por IA</h3>
            <p className="text-sm text-slate-500">Utilize a inteligência artificial do Google Gemini para corrigir gramática e melhorar seus textos instantaneamente.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3 mx-auto md:mx-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Simples e Gratuito</h3>
            <p className="text-sm text-slate-500">Interface limpa e focada no que importa: transformar suas ideias em documentos profissionais.</p>
          </div>
        </div>

      </main>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;