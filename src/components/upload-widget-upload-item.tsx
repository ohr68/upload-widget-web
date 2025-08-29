import * as Progress from '@radix-ui/react-progress'
import { motion } from 'motion/react'
import { Download, ImageUp, Link2, RefreshCcw, X } from 'lucide-react'
import { Button } from './ui/button'
import { useUploads, type Upload } from '../store/uploads'
import { formatBytes } from '../utils/format-bytes'
import { downloadUrl } from '../utils/download-url'

interface UploadWidgetItemProps {
  uploadId: string
  upload: Upload
}

export function UploadWidgetUploadItem ({ uploadId, upload } : UploadWidgetItemProps) {
  const cancelUpload = useUploads(store => store.cancelUpload)
  const retryUpload = useUploads(store => store.retryUpload)

  const progress = Math.min(
    upload.compressSizeInBytes
      ? Math.round((upload.uploadSizeInBytes * 100) / upload.compressSizeInBytes)
      : 0,
    100
  )

  const compressionResultPercentage = !upload.compressSizeInBytes
    ? 0
    : (1 - Math.round((upload.originalSizeInBytes - upload.compressSizeInBytes) *
  100 / upload.originalSizeInBytes))

  const compressionResultBaseClassName = 'ml-1'
  const compressionResultClassName = compressionResultPercentage! < 0
    ? compressionResultBaseClassName.concat(' ', 'text-green-400')
    : compressionResultBaseClassName.concat(' ', 'text-red-400')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className='p-3 rounded-lg flex flex-col gap-3 shadow-shape-content
        bg-white/2 relative overflow-hidden'
    >
      <div className='flex flex-col gap-1'>
        <span className='text-xs font-medium flex items-center gap-1'>
          <ImageUp className='size-3 text-zinc-300' strokeWidth={1.5} />
          <span
            className='truncate max-w-[180px]'
            title={upload.name}
          >
            {upload.name}
          </span>
        </span>

        <span className='text-xxs text-zinc-400 flex gap-1.5 items-center'>
          <span>{formatBytes(upload.originalSizeInBytes)}</span>
          <div className='size-1 rounded-full bg-zinc-700' />
          <span>
            {formatBytes(upload.compressSizeInBytes ?? 0)}
            {upload.compressSizeInBytes && (
              <span className={compressionResultClassName}>
                {compressionResultPercentage}%
              </span>
            )}
          </span>
          <div className='size-1 rounded-full bg-zinc-700' />
          {upload.status === 'success' && <span>100%</span>}
          {upload.status === 'progress' && <span>{progress}</span>}
          {upload.status === 'error' && <span className='text-red-400'>Error</span>}
          {upload.status === 'canceled' && <span className='text-yellow-400'>Canceled</span>}

        </span>
      </div>

      <Progress.Root
        value={progress}
        data-status={upload.status}
        className='group bg-zinc-800 rounded-full h-1 overflow-hidden'
      >
        <Progress.Indicator
          className='bg-indigo-500 h-1 group-data-[status=success]:bg-green-400
          group-data-[status=error]:bg-red-400
          group-data-[status=canceled]:bg-yellow-400 transition-all'
          style={{ width: upload.status === 'progress' ? `${progress}%` : '100%' }}
        />
      </Progress.Root>

      <div className='absolute top-2 right-2 flex items-center gap-1'>
        <Button
          size='icon-sm'
          aria-disabled={!upload.remoteUrl}
          onClick={() => {
            if (upload.remoteUrl) {
              downloadUrl(upload.remoteUrl)
            }
          }}
        >
          <Download className='size-4' strokeWidth={1.5} />
          <span className='sr-only'>Download compressed image</span>
        </Button>
        <Button
          size='icon-sm'
          disabled={!upload.remoteUrl}
          onClick={() => upload.remoteUrl && navigator.clipboard.writeText(upload.remoteUrl)}
        >
          <Link2 className='size-4' strokeWidth={1.5} />
          <span className='sr-only'>Copy remote URL</span>
        </Button>
        <Button
          size='icon-sm'
          disabled={!['canceled', 'error'].includes(upload.status)}
          onClick={() => retryUpload(uploadId)}
        >
          <RefreshCcw className='size-4' strokeWidth={1.5} />
          <span className='sr-only'>Retry upload</span>
        </Button>
        <Button
          size='icon-sm'
          disabled={upload.status !== 'progress'}
          onClick={() => cancelUpload(uploadId)}
        >
          <X className='size-4' strokeWidth={1.5} />
          <span className='sr-only'>Cancel upload</span>
        </Button>
      </div>
    </motion.div>
  )
}
