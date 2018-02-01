class Decoder {
  let _encoding;
  let _charBuffer = new Buffer(6);
  let _charOffset = 0;
  let _charLength = 0;
  let _surrogateSize = 0;

  let detectIncomplete = buffer => {
    switch (_encoding) {
      case 'utf8': return detectIncompleteUTF8(buffer);
      case 'utf16le': return detectIncompleteUTF16(buffer);
      case 'base64': return detectIncompleteBase64(buffer);
      default: throw new Error('Invalid encoding');
    }
  };

  let detectIncompleteUTF8 = buffer => {
    let c, i;
    for (i = Math.min(buffer.length, 3); i > 0; i--) {
      c = buffer[buffer.length - i];
      if (i == 1 && c >> 5 === 0x06) { // 110XXXXX
        _charLength = 2;
        break;
      }

      if (i <= 2 && c >> 4 === 0x0E) { // 1110XXXX
        _charLength = 3;
        break;
      }

      if (i <= 3 && c >> 3 === 0x1E) { // 11110XXX
        _charLength = 4;
        break;
      }
    }
    return i;
  }

  let detectIncompleteUTF16 = buffer => {
    _charOffset = buffer.length % 2;
    _charLength = _charOffset ? 2 : 0;
    return _charOffset;
  };

  let detectIncompleteBase64 = buffer => {
    _charOffset = buffer.length % 3;
    _charLength = _charOffset ? 3 : 0;
    return _charOffset;
  };

  constructor(encoding = 'utf8') {
    _encoding = encoding
      .toLowerCase()
      .replace(/[-_]/, '')
      .replace(/^usc2$/, 'utf16le');

    switch (_encoding) {
      case 'utf8': _surrogateSize = 3; break;
      case 'utf16le': _surrogateSize = 2; break;
      case 'base64': _surrogateSize = 3; break;
    }
  }

  decodeBuffer(buffer) {
    if (_surrogateSize === 0)
      return buffer.toString(_encoding);

    let value = '';
    let charCode = 0;
    let offset = 0;
    let size;
    let len;
    let end;

    // If the last write ended with an incomplete character...
    while (_charLength) {
      // Attempt to fill the char buffer
      len = Math.min(_charLength - _charOffset, buffer.length);
      buffer.copy(_charBuffer, _charOffset, offset, len);

      _charOffset += (len - offset);
      offset = len;

      // If the char buffer is still not filled, exit and wait for more data
      if (_charOffset < _charLength)
        return null;

      // Get the character that was split
      value = _charBuffer.slice(0, _charLength).toString(_encoding);
      _charCode = value.charCodeAt(value.length - 1);

      // If character is the first of a surrogate pair...
      if (_charCode >= 0xD800 && _charCode <= 0xDBFF) {
        // Extend the char buffer and attempt to fill it
        value = '';
        _charLength += _surrogateSize;
        continue;
      }

      // Reset the char buffer
      _charOffset =
      _charLength = 0;

      // If there are no more bytes in this buffer, exit
      if (len === buffer.length)
        return value;

      buffer = buffer.slice(len);
      break;
    }

    len = detectIncomplete(buffer);
    end = buffer.length;

    if (_charLength) {
      // Put incomplete character data into the char buffer
      buffer.copy(_charBuffer, 0, buffer.length - len, end);
      _charOffset = len;
      end -= len;
    }

    value += buffer.toString(_encoding, 0, end);
    end = value.length;

    // Get the last character in the string
    _charCode = value.charCodeAt(value.length - 1);

    // If character is a lead surrogate...
    if (_charCode >= 0xD800 && _charCode <= 0xDBFF) {
      end = value.length - 1;
      size = _surrogateSize;

      // Add surrogate data to the char buffer
      _charLength += size;
      _charOffset += size;
      _charBuffer.copy(_charBuffer, size, 0, size);
      _charBuffer.write(value.charAt(end), _encoding);
    }

    return value.slice(0, end);
  }

  finalize() {
    if (_charOffset)
      return _charBuffer.slice(0, _charOffset).toString(_encoding);

    return null;
  }

}
