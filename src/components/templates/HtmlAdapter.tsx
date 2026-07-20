import React, { useEffect, useState, useMemo, useRef } from 'react';
import { TemplateProps } from '@/types/template';

interface HtmlAdapterProps extends TemplateProps {
  templateId: string;
  domOverrides?: Record<string, string>;
}

export default function HtmlAdapter({ templateId, data, photo, timeLeft, domOverrides = {} }: HtmlAdapterProps) {
  const initialOverrides = useRef(domOverrides);
  const [htmlContent, setHtmlContent] = useState<string>('<div style="padding: 2rem; text-align: center;">Memuat template HTML...</div>');
  const [cssContent, setCssContent] = useState<string>('');
  const [jsContent, setJsContent] = useState<string>('');
  const [templateType, setTemplateType] = useState<string>('html');
  const [error, setError] = useState<string | null>(null);

  // Gunakan state terpisah untuk iframe debounce
  const [debouncedData, setDebouncedData] = useState(data);

  useEffect(() => {
    // Memuat dari CMS API
    fetch(`http://localhost:3001/api/templates/${templateId}`)
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((resData) => {
        setHtmlContent(resData.htmlContent || '');
        setCssContent(resData.cssContent || '');
        setJsContent(resData.jsContent || '');
        setTemplateType(resData.type || 'html');
        setError(null);
      })
      .catch((apiErr) => {
        // Fallback: Memuat file HTML lokal dari folder public jika CMS tidak jalan
        console.warn('API CMS tidak tersedia, fallback ke local folder', apiErr);
        fetch(`/templates/${templateId}/index.html`)
          .then((res) => {
            if (!res.ok) throw new Error('File HTML lokal tidak ditemukan');
            return res.text();
          })
          .then((html) => {
            setHtmlContent(html);
            setTemplateType('html');
            setError(null);
          })
          .catch((err) => {
            setError(`Gagal memuat template: ${err.message}`);
            setHtmlContent('');
          });
      });
  }, [templateId]);

  // Debounce logic untuk Iframe agar tidak kedip tiap ketik
  useEffect(() => {
    if (templateType === 'html-js') {
      const timer = setTimeout(() => {
        setDebouncedData(data);
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    } else {
      // Jika HTML biasa, langsung update tanpa debounce
      setDebouncedData(data);
    }
  }, [data, templateType]);

  // Menggabungkan data dengan HTML dan JS mentah
  const getInjectedContent = (targetData: typeof data, targetTimeLeft: typeof timeLeft, rawContent: string) => {
    let injected = rawContent;

    const replaceTag = (tag: string, value: string) => {
      injected = injected.replace(new RegExp(`{{${tag}}}`, 'g'), value || '');
    };

    // Data Pengantin
    replaceTag('groomName', targetData.groomName);
    replaceTag('brideName', targetData.brideName);
    replaceTag('weddingDate', targetData.weddingDate);
    replaceTag('mainVenue', targetData.mainVenue);
    replaceTag('dressCode', targetData.dressCode);
    replaceTag('greeting', targetData.greeting);
    
    // Waktu
    replaceTag('akadTime', targetData.akadTime);
    replaceTag('akadVenue', targetData.akadVenue);
    replaceTag('resepsiTime', targetData.resepsiTime);
    replaceTag('resepsiVenue', targetData.resepsiVenue);
    replaceTag('days', targetTimeLeft.days);
    replaceTag('hours', targetTimeLeft.hours);
    replaceTag('minutes', targetTimeLeft.minutes);
    replaceTag('seconds', targetTimeLeft.seconds);

    const photoUrl = photo || '/images/templates/agung.png'; 
    replaceTag('photoUrl', photoUrl);

    return injected;
  };

  const latestOverrides = useRef(domOverrides);
  useEffect(() => {
    latestOverrides.current = domOverrides;
  }, [domOverrides]);

  const iframeSrcDoc = useMemo(() => {
    if (templateType !== 'html-js') return '';

    const injectedHtml = getInjectedContent(debouncedData, timeLeft, htmlContent);
    const injectedJs = getInjectedContent(debouncedData, timeLeft, jsContent);
    
    const builderScript = `
      (function() {
        const style = document.createElement('style');
        style.innerHTML = \`
          .wev-editable { outline: 2px dashed rgba(200, 200, 200, 0); cursor: pointer; transition: outline 0.2s; position: relative; }
          .wev-editable:hover { outline: 2px dashed #0070f3; }
          .wev-selected { outline: 2px solid #0070f3 !important; }
        \`;
        document.head.appendChild(style);

        const overrides = ${JSON.stringify(latestOverrides.current || {})};
        Object.keys(overrides).forEach(selector => {
          try {
            const el = document.querySelector(selector);
            if (el) {
              if (el.tagName === 'IMG') { el.src = overrides[selector]; }
              else if (overrides[selector].startsWith('url(') || overrides[selector].startsWith('data:image')) {
                el.style.backgroundImage = overrides[selector].startsWith('url(') ? overrides[selector] : \`url('\${overrides[selector]}')\`;
              }
              else { el.innerHTML = overrides[selector]; }
            }
          } catch(e) {}
        });

        const editableTags = 'h1, h2, h3, h4, h5, h6, p, span, li, img, [style*="background-image"]'.split(', ');
        
        function getUniqueSelector(el) {
          if (el.id) return '#' + el.id;
          let path = [];
          while (el && el.nodeType === Node.ELEMENT_NODE && el.tagName !== 'BODY') {
            let selector = el.nodeName.toLowerCase();
            if (el.id) {
              selector += '#' + el.id; path.unshift(selector); break;
            } else {
              let sib = el, nth = 1;
              while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector) nth++;
              }
              if (nth != 1) selector += ":nth-of-type("+nth+")";
            }
            path.unshift(selector);
            el = el.parentNode;
          }
          return path.join(' > ');
        }

        function initEditableElements() {
          // Floating Button untuk Image
          if (!document.getElementById('wev-img-btn')) {
            const btn = document.createElement('div');
            btn.id = 'wev-img-btn';
            btn.innerHTML = '📸 Edit Gambar';
            btn.style.cssText = 'position: absolute; z-index: 10000; padding: 6px 12px; background: #0070f3; color: white; border-radius: 20px; font-size: 12px; pointer-events: none; display: none; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold;';
            document.body.appendChild(btn);
            
            window.addEventListener('scroll', () => {
              if (window.wevCurrentImgTarget) {
                const rect = window.wevCurrentImgTarget.getBoundingClientRect();
                btn.style.top = (window.scrollY + rect.top + 10) + 'px';
                btn.style.left = (window.scrollX + rect.left + 10) + 'px';
              }
            }, true);
          }

          const editableElements = document.querySelectorAll(editableTags.join(', '));
          editableElements.forEach(el => {
            if (!el.classList.contains('wev-editable')) el.classList.add('wev-editable');
            if (!el.dataset.wevSelector) el.dataset.wevSelector = getUniqueSelector(el);
            
            let isImage = el.tagName === 'IMG';
            let isBgImage = el.style && el.style.backgroundImage && el.style.backgroundImage !== '';

            if (isImage || isBgImage) {
              el.addEventListener('mouseenter', () => {
                window.wevCurrentImgTarget = el;
                const rect = el.getBoundingClientRect();
                const btn = document.getElementById('wev-img-btn');
                if (btn) {
                  btn.style.top = (window.scrollY + rect.top + 10) + 'px';
                  btn.style.left = (window.scrollX + rect.left + 10) + 'px';
                  btn.style.display = 'block';
                }
              });
              el.addEventListener('mouseleave', () => {
                window.wevCurrentImgTarget = null;
                const btn = document.getElementById('wev-img-btn');
                if (btn) btn.style.display = 'none';
              });
            }

            el.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              document.querySelectorAll('.wev-selected').forEach(s => s.classList.remove('wev-selected'));
              el.classList.add('wev-selected');
              
              let content = el.innerText;
              let reportedTagName = el.tagName;
              
              if (isImage) {
                content = el.src;
              } else if (isBgImage) {
                content = el.style.backgroundImage;
                reportedTagName = 'IMG'; 
              }

              window.parent.postMessage({
                type: 'ELEMENT_CLICKED',
                selector: el.dataset.wevSelector,
                content: content,
                tagName: reportedTagName,
                isBgImage: isBgImage
              }, '*');
            };
          });
        }
        
        setTimeout(initEditableElements, 500);

        setTimeout(() => {
          const sections = Array.from(document.querySelectorAll('section, .section, header, footer, div[id*="hero"], div[id*="gallery"]'));
          const sectionData = sections.map((sec, index) => {
            if (!sec.id) sec.id = 'wev-section-' + index;
            return {
              id: sec.id,
              name: sec.getAttribute('data-name') || sec.id || sec.className || 'Section ' + (index + 1)
            };
          }).filter(s => s.name && typeof s.name === 'string');

          window.parent.postMessage({ type: 'SECTIONS_DETECTED', sections: sectionData }, '*');
        }, 1000);

        window.addEventListener('message', (event) => {
          const msg = event.data;
          if (msg.type === 'UPDATE_ELEMENT' && msg.selector) {
            try {
              const el = document.querySelector(msg.selector);
              if (el) {
                if (el.tagName === 'IMG') {
                  el.src = msg.content;
                } else if (el.style && el.style.backgroundImage && el.style.backgroundImage !== '') {
                  el.style.backgroundImage = msg.content.startsWith('url(') ? msg.content : \`url('\${msg.content}')\`;
                } else {
                  el.innerHTML = msg.content.replace(/\\n/g, '<br>');
                }
              }
            } catch(e) {}
          }
          if (msg.type === 'SCROLL_TO_SECTION' && msg.id) {
            const el = document.getElementById(msg.id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        });
      })();
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; font-family: ${debouncedData.fontFamily}; }
          ${cssContent}
        </style>
      </head>
      <body>
        ${injectedHtml}
        <script>
          ${injectedJs}
        </script>
        <script>
          ${builderScript}
        </script>
      </body>
      </html>
    `;
  }, [debouncedData, htmlContent, cssContent, jsContent, templateType]); // Hapus timeLeft dari dependency jika tidak ingin timer mereload iframe tiap detik! (Tetapi jika timeLeft tidak diubah di iframe, timer preview akan stuck. Untuk saat ini kita abaikan reload tiap detik demi stabilitas visual editor, atau timeLeft bisa tetap disertakan jika user belum komplain)

  if (error) return <div style={{ color: 'red', padding: '1rem' }}>{error}</div>;

  if (templateType === 'html-js') {
    return (
      <div className="html-template-wrapper" style={{ width: '100%', height: '100%' }}>
        <iframe 
          srcDoc={iframeSrcDoc} 
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-scripts allow-same-origin"
          title="Template Preview Sandbox"
        />
      </div>
    );
  }

  // Vanilla HTML Mode (DangerouslySetInnerHTML)
  const injectedHtml = getInjectedContent(data, timeLeft, htmlContent); // No debounce needed

  return (
    <div className="html-template-wrapper" style={{ fontFamily: data.fontFamily, width: '100%', height: '100%', overflowX: 'hidden' }}>
      {cssContent ? (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      ) : (
        <link rel="stylesheet" href={`/templates/${templateId}/style.css`} />
      )}
      <div dangerouslySetInnerHTML={{ __html: injectedHtml }} />
    </div>
  );
}
