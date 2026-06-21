import { useState, type ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiBaseUrl } from '../api/client';

export function ImagesPage() {
  const { accessToken } = useAuth();
  const [uploadedUrl, setUploadedUrl] = useState('');

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !accessToken) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiBaseUrl}/admin/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    const body = await response.json();
    if (response.ok) setUploadedUrl(body.data.url);
  }

  return (
    <div>
      <h1>Imagens</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploadedUrl && <img src={uploadedUrl} alt="Enviada" style={{ maxWidth: 320 }} />}
    </div>
  );
}
