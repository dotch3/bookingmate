# Bug Evidence Directory

This directory contains screenshots, videos, logs, and other evidence files related to bugs found during test execution.

## Naming Convention

Evidence files should follow this naming convention:

```
BUG{ID}_{description}_{date}_{sequence}.{extension}
```

Example:
```
BUG001_login_error_20230815_01.png
BUG001_login_error_20230815_02.png
BUG002_reservation_overlap_20230816_01.mp4
```

## Organization

For bugs with multiple evidence files, consider creating subdirectories:

```
/BUG001/
  - screenshot_01.png
  - screenshot_02.png
  - console_log.txt
```

## Evidence Types

- **Screenshots**: Capture the UI state showing the bug
- **Videos**: Record user interactions that trigger the bug
- **Console logs**: Browser console errors or warnings
- **Network logs**: API responses or request failures
- **Application logs**: Server-side errors

## Linking Evidence

When creating bug reports in DefectReports.md, reference these evidence files using relative paths:

```markdown
![Login Error](/Users/dotch3/Documents/MENTORIAQA2.0/projetos/portfolio-project/bookingmate/docs/source-documents/bug-evidence/BUG001_login_error_20230815_01.png)
```