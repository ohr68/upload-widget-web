import { create } from 'zustand'
import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { uploadFileToStorage } from '../http/upload-file-to-storage'

export type Upload = {
  name: string
  file: File
  abortController: AbortController
  status: 'progress' | 'success' | 'error' | 'canceled'
}

type UploadsState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void
  cancelUpload: (uploadId: string) => void
}

enableMapSet()

export const useUploads = create<UploadsState, [['zustand/immer', never]]>(
  immer((set, get) => {
    async function processUploads (uploadId: string) {
      const upload = get().uploads.get(uploadId)

      if (!upload) {
        return
      }

      await uploadFileToStorage(
        { file: upload.file },
        { signal: upload.abortController.signal }
      )

      try {
        set(state => {
          state.uploads.set(uploadId, {
            ...upload,
            status: 'success'
          })
        })
      } catch {
        set(state => {
          state.uploads.set(uploadId, {
            ...upload,
            status: 'error'
          })
        })
      }
    }

    function addUploads (files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID()
        const abortController = new AbortController()

        const upload: Upload = {
          name: file.name,
          file,
          abortController,
          status: 'progress'
        }

        set(state => {
          state.uploads.set(uploadId, upload)
        })

        processUploads(uploadId)
      }
    }

    function cancelUpload (uploadId:string) {
      const upload = get().uploads.get(uploadId)

      if (!upload) {
        return
      }

      upload.abortController.abort()

      set(state => {
        state.uploads.set(uploadId, {
          ...upload,
          status: 'canceled'
        })
      })
    }

    return {
      uploads: new Map(),
      addUploads,
      cancelUpload
    }
  }))
