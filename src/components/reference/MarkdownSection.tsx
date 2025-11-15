import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'

interface MarkdownSectionProps {
  src: string
  title?: string
}

const MarkdownSection: React.FC<MarkdownSectionProps> = ({ src, title }) => {
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    fetch(src)
      .then(async (r) => {
        if (!r.ok) throw new Error('not_found')
        const text = await r.text()
        setContent(text)
        setError(null)
      })
      .catch(() => {
        setError('Sadržaj nije dostupan')
      })
      .finally(() => setLoading(false))
  }, [src])

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} /> Učitavanje…</Box>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ '& p': { mb: 2 } }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Box>
    </Box>
  )
}

export default MarkdownSection