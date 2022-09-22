import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export default function MainProgress(label: string) {
    return (
      <Box position="relative" display="inline-flex">
        <CircularProgress className="Main-spinner" />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div" color="textSecondary">{label}</Typography>
        </Box>
      </Box>
    );
  }