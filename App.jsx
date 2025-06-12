import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Upload, Download, Share, Image as ImageIcon } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const styles = [
    { value: 'anime', label: 'アニメ風' },
    { value: 'watercolor', label: '水彩画風' },
    { value: 'oil', label: '油絵風' },
    { value: 'sketch', label: 'スケッチ風' }
  ]

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'image/jpeg') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    } else {
      alert('JPEG形式の画像を選択してください。')
    }
  }

  const handleStyleChange = (value) => {
    setSelectedStyle(value)
  }

  const processImage = async () => {
    if (!selectedImage || !selectedStyle) {
      alert('画像とスタイルを選択してください。')
      return
    }

    setIsProcessing(true)
    
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
      })

      if (response.ok) {
        const result = await response.json()
        setProcessedImage(result.processed_image)
      } else {
        const error = await response.json()
        alert(`エラー: ${error.error}`)
      }
    } catch (error) {
      alert(`通信エラー: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = `illustrated_${selectedStyle}_${Date.now()}.jpg`
    link.click()
  }

  const shareToX = () => {
    if (!processedImage) return
    
    const text = encodeURIComponent(`Image Illustratorで画像を${styles.find(s => s.value === selectedStyle)?.label}に変換しました！ #ImageIllustrator #イラスト化`)
    const url = encodeURIComponent(window.location.href)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Image Illustrator</h1>
          <p className="text-lg text-gray-600">JPEG画像を様々なイラストスタイルに変換</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* アップロードエリア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                画像アップロード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="アップロード画像" 
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <div>
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">クリックしてJPEG画像を選択</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* プレビューエリア */}
          <Card>
            <CardHeader>
              <CardTitle>プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-8 text-center min-h-64 flex items-center justify-center">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">処理中...</p>
                  </div>
                ) : processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="変換後画像" 
                    className="max-w-full max-h-64 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-400">変換後の画像がここに表示されます</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* コントロールエリア */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-48">
                  <Select value={selectedStyle} onValueChange={handleStyleChange}>
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
                  className="w-full md:w-auto"
                >
                  イラスト化実行
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadImage}
                  disabled={!processedImage}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  ダウンロード
                </Button>
                <Button 
                  variant="outline" 
                  onClick={shareToX}
                  disabled={!processedImage}
                  className="flex items-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Xでシェア
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <footer className="text-center mt-8 text-gray-500">
          <p>&copy; 2024 Image Illustrator. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default App

