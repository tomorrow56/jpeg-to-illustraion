import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Share2, Image as ImageIcon, Loader2 } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const styles = [
    { value: 'anime', label: 'アニメ風' },
    { value: 'watercolor', label: '水彩画風' },
    { value: 'oil', label: '油絵風' },
    { value: 'sketch', label: 'スケッチ風' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      alert('JPEGまたはPNG形式の画像を選択してください。');
    }
  };

  const handleStyleChange = (value) => {
    setSelectedStyle(value);
  };

  const processImage = async () => {
    if (!selectedImage || !selectedStyle) {
      alert('画像とスタイルを選択してください。');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: selectedImage,
          style: selectedStyle
        })
      });

      if (response.ok) {
        const result = await response.json();
        setProcessedImage(result.processed_image);
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      alert(`通信エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `illustrated_${selectedStyle}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareToX = () => {
    if (!processedImage) return;
    
    const text = encodeURIComponent(`Image Illustratorで画像を${styles.find(s => s.value === selectedStyle)?.label}に変換しました！ #ImageIllustrator #イラスト化`);
    const url = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div style={{ maxWidth: '1800px' }} className="mx-auto w-full px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Illustrator</h1>
          <p className="text-gray-600">JPEG画像を様々なイラストスタイルに変換</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', minHeight: '600px' }}>
          {/* 左ペイン：元画像 */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h2 className="text-lg font-medium text-gray-800 mb-4">元画像</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              {selectedImage ? (
                <div className="relative w-full aspect-square">
                  <img 
                    src={selectedImage} 
                    alt="アップロードされた画像" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">画像をアップロード</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg, image/png"
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                画像を選択
              </Button>
              
              <div className="w-64 mx-auto">
                <Select onValueChange={handleStyleChange} value={selectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="スタイルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={processImage} 
                disabled={!selectedImage || !selectedStyle || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  'イラスト化実行'
                )}
              </Button>
            </div>
          </div>
          
          {/* 右ペイン：変換後画像 */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
            <h2 className="text-lg font-medium text-gray-800 mb-4">変換後画像</h2>
            <div className="border-2 border-gray-200 rounded-lg p-4 mb-4">
              {processedImage ? (
                <div className="relative w-full aspect-square">
                  <img 
                    src={processedImage} 
                    alt="変換された画像" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>変換された画像がここに表示されます</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={downloadImage}
                variant="outline"
                className="flex-1"
                disabled={!processedImage}
              >
                <Download className="w-4 h-4 mr-2" />
                ダウンロード
              </Button>
              <Button 
                onClick={shareToX}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!processedImage}
              >
                <Share2 className="w-4 h-4 mr-2" />
                共有
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
