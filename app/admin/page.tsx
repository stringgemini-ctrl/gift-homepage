'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return alert('사진과 제목을 모두 입력해주세요!');

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('activity-images')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('activity-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('Activity') 
        .insert([{ title, image_url: publicUrl }]);

      if (dbError) throw dbError;

      alert('업로드 성공!');
      setTitle('');
      setFile(null);
      router.refresh();
    } catch (error: any) {
      alert('에러 발생: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-lg bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-900">활동 갤러리 관리자</h1>
        <Link href="/admin/users" className="text-sm font-bold text-[#0098a6] hover:underline">
          회원 관리 →
        </Link>
      </div>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">행사 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">사진 선택</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-black transition ${
            loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {loading ? '업로드 중...' : '갤러리에 올리기'}
        </button>
      </form>
    </div>
  );
}