export function getExtension(filename) {
  const parts = filename.split('.');
  return parts[parts.length - 1];
}

export function isImage(filename) {
  const ext = getExtension(filename);
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
      //etc
      return true;
  }
  return false;
}
