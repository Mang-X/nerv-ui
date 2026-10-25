# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
from hashlib import sha256
import json
root=Path('frontend/apps/playground/public/files')
parts=[]
for i,(title,color) in enumerate([('MORNING FOREST','228B22'),('RIVER WALK','2673C9'),('SUNSET NOTES','E87524')]):
 if i: parts.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
 parts.append(f'<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>{title}</w:t></w:r></w:p><w:p><w:r><w:t>Reading journey - page {i+1} of 3. A locally generated preview sample.</w:t></w:r></w:p>')
 parts.append(f'<w:tbl><w:tblPr><w:tblW w:w="7200" w:type="dxa"/></w:tblPr><w:tblGrid><w:gridCol w:w="7200"/></w:tblGrid><w:tr><w:trPr><w:trHeight w:val="1800" w:hRule="atLeast"/></w:trPr><w:tc><w:tcPr><w:tcW w:w="7200" w:type="dxa"/><w:shd w:fill="{color}"/></w:tcPr><w:p><w:r><w:rPr><w:color w:val="FFFFFF"/><w:sz w:val="40"/></w:rPr><w:t>{title} COLOR PANEL</w:t></w:r></w:p></w:tc></w:tr></w:tbl>')
doc='<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join(parts)+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>'
with ZipFile(root/'quality-work-instruction.docx') as source, ZipFile(root/'reading-journey.docx','w') as output:
 for name in sorted(source.namelist()):
  info=ZipInfo(name, (2026,10,25,0,0,0));info.compress_type=ZIP_DEFLATED
  output.writestr(info,doc.encode() if name=='word/document.xml' else source.read(name))
for ext in ['docx','xlsx','pptx']: (root/f'broken.{ext}').write_bytes(b'Deliberately invalid OOXML fixture. No personal data.\n')
files=['quality-work-instruction.docx','reading-journey.docx','inspection-metrics.xlsx','preview-review-deck.pptx','broken.docx','broken.xlsx','broken.pptx']
Path('/tmp/nerv-ui-t06-f05/raw/fixtures.json').write_text(json.dumps([{'path':str(root/f),'bytes':(root/f).stat().st_size,'sha256':sha256((root/f).read_bytes()).hexdigest()} for f in files],indent=2))
