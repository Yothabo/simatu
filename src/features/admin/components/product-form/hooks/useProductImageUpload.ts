import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../../../../utils/supabase';
import type { AdminProduct } from '../types';

type Args = {
  setForm: (updater: (prev: AdminProduct) => AdminProduct) => void;
};

export function useProductImageUpload({ setForm }: Args) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0];
      if (!file) return;

      setIsUploading(true);

      try {
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!supportedTypes.includes(file.type)) {
          throw new Error('Please select a JPEG, PNG, or WebP image.');
        }

        const optimizedFile = await new Promise<File>((resolve, reject) => {
          const objectUrl = URL.createObjectURL(file);
          const image = new Image();

          const cleanup = () => URL.revokeObjectURL(objectUrl);

          image.onload = () => {
            try {
              const maxDimension = 1600;
              const scale = Math.min(
                1,
                maxDimension /
                  Math.max(image.naturalWidth, image.naturalHeight),
              );

              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
              canvas.height = Math.max(
                1,
                Math.round(image.naturalHeight * scale),
              );

              const context = canvas.getContext('2d');

              if (!context) {
                throw new Error('Could not process this image.');
              }

              context.drawImage(image, 0, 0, canvas.width, canvas.height);

              canvas.toBlob(
                (blob) => {
                  cleanup();

                  if (!blob || blob.type !== 'image/webp') {
                    reject(
                      new Error(
                        'Your browser could not convert this image to WebP.',
                      ),
                    );
                    return;
                  }

                  const filename =
                    file.name.replace(/\.[^.]+$/, '') || 'product';

                  resolve(
                    new File([blob], `${filename}.webp`, {
                      type: 'image/webp',
                      lastModified: Date.now(),
                    }),
                  );
                },
                'image/webp',
                0.82,
              );
            } catch (error) {
              cleanup();
              reject(error);
            }
          };

          image.onerror = () => {
            cleanup();
            reject(new Error('Could not read this image. Try another file.'));
          };

          image.src = objectUrl;
        });

        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.webp`;

        const { error } = await supabase.storage
          .from('products')
          .upload(path, optimizedFile, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          });

        if (error) {
          throw new Error(error.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('products').getPublicUrl(path);

        setForm((prev) => ({ ...prev, image_url: publicUrl }));
        toast.success('Image optimised and uploaded');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.';
        toast.error('Image upload failed: ' + message);
      } finally {
        setIsUploading(false);
        input.value = '';
      }
    },
    [setForm],
  );

  return { isUploading, handleImageUpload };
}
