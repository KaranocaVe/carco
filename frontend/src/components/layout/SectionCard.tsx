import { Card, CardContent, Box, Typography, IconButton, Popover } from '@mui/material'
import type { ReactNode, MouseEvent } from 'react'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

export default function SectionCard({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = (globalThis as any).React?.useState ? (globalThis as any).React.useState<HTMLElement | null>(null) : [null, (_v: HTMLElement | null) => {}];
  const openMenu = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <Card>
      {(title || actions) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, pb: 1, flexWrap: 'wrap' }}>
          {title && <Typography variant="h6">{title}</Typography>}
          {actions && (
            isSm ? (
              <Box sx={{ ml: 'auto' }}>
                <IconButton onClick={openMenu}>
                  <MoreHorizRoundedIcon />
                </IconButton>
                <Popover
                  open={open}
                  anchorEl={anchorEl}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', maxWidth: 320 }}>
                    {actions}
                  </Box>
                </Popover>
              </Box>
            ) : (
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {actions}
              </Box>
            )
          )}
        </Box>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}


