import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { AppError, ErrorCode } from '@lms/shared'
import * as service from './export.service.js'

const router = Router()

// 导出知识 (CSV 或 TEXT)
router.get('/knowledge', authenticate, async (req, res, next) => {
  try {
    const format = (req.query.format as string) || 'csv'
    const data = await service.getExportData(req.user!.userId, 'knowledge')

    if (format === 'text' || format === 'txt') {
      const text = service.formatAsText(data)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="knowledge.txt"')
      return res.send('\uFEFF' + text) // BOM for Chinese
    }

    // Default: CSV
    const csv = service.formatAsCSV(data)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="knowledge.csv"')
    res.send('\uFEFF' + csv) // BOM for Chinese
  } catch (err) {
    next(err)
  }
})

// 导出笔记
router.get('/notes', authenticate, async (req, res, next) => {
  try {
    const format = (req.query.format as string) || 'text'
    const data = await service.getExportData(req.user!.userId, 'notes')

    if (format === 'csv') {
      const csv = service.formatAsCSV(data)
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="notes.csv"')
      return res.send('\uFEFF' + csv)
    }

    // Default: TEXT
    const text = service.formatAsText(data)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="notes.txt"')
    res.send('\uFEFF' + text)
  } catch (err) {
    next(err)
  }
})

export default router
