# Spike Simulation Test Guide

## Feature Overview
The spike simulation feature allows testing the complete forensic analysis and report generation workflow by simulating a critical pollution event.

## How to Test

### 1. Access the Dashboard
- Navigate to `http://localhost:7475/dashboard`
- Wait for the dashboard to load with the interactive map and station data

### 2. Trigger Spike Simulation
- Look at the **RIGHT PANEL** header labeled "CHAIN OF EVIDENCE"
- Click the **"SIMULATE SPIKE"** button (amber colored, top-right of the panel)

### 3. Expected Behavior

#### Immediate Visual Changes:
1. **Toast Notification**: Red error toast appears with message:
   ```
   CRITICAL SPIKE DETECTED: Pashamylaram PM2.5 287.6 µg/m³
   ```

2. **Station Selection**: IDA PASHAMYLARAM CAAQMS automatically selected

3. **Updated Metrics**:
   - PM2.5: Changes from 152.4 to **287.6 µg/m³**
   - Z-Score: Changes from 4.2 to **6.8σ**
   - Status: Remains **CRITICAL**

4. **Top Bar**: Critical count badge updates

5. **Map**: Pashamylaram marker pulses with red glow

6. **Ticker**: Updates with new PM2.5 value

#### Forensic Panel Updates:
- **Source Confidence**: Shows HIGH 89%
- **Evidence Chain**: All 4 indicators active (green dots)
  - Wind Trajectory: WITHIN 5km UPWIND
  - Satellite Match: SPECTRAL CONFIRMED
  - Concentration: 287.6 µg/m³
  - Z-Score Anomaly: 6.8σ
- **Attribution Box**: Red box showing PATANCHERU INDUSTRIAL
- **Enforcement Buttons**: Both buttons visible

### 4. Test Report Generation
- Click **"EXPORT PDF REPORT"** button (white border, bottom of panel)
- Expected: 
  - Green success toast: "Report exported successfully"
  - Text file downloads: `ECO-SENTINEL-REPORT-s1-[timestamp].txt`

### 5. Verify Report Contents
Open the downloaded report file and verify it contains:
- ✓ Incident classification: CRITICAL
- ✓ Station identification with coordinates
- ✓ PM2.5: 287.6 µg/m³
- ✓ Z-Score: 6.8σ
- ✓ Source confidence: 89%
- ✓ Evidence chain breakdown
- ✓ Attributed source: PATANCHERU INDUSTRIAL
- ✓ Recommended actions (5 steps)
- ✓ Legal authority references

### 6. Test Dispatch Function
- Click **"DISPATCH INSPECTION TEAM"** button (red background, top button)
- Expected:
  - Green success toast: "Inspection team dispatched to IDA PASHAMYLARAM CAAQMS. ETA: 45 minutes."

## Simulated Data

The spike simulation modifies station `s1` with these values:
```typescript
{
  id: 's1',
  name: 'IDA PASHAMYLARAM CAAQMS',
  source: 'CPCB',
  lat: 17.525,
  lng: 78.215,
  pm25: 287.6,      // Increased from 152.4
  status: 'CRITICAL',
  zscore: 6.8        // Increased from 4.2
}
```

## Success Criteria
✅ Spike simulation button triggers state update
✅ Toast notifications appear correctly
✅ Station data updates in all UI components
✅ Report file downloads with correct content
✅ Dispatch button shows confirmation toast
✅ All forensic evidence indicators update
✅ Map marker reflects critical status

## Notes
- The simulation only affects the frontend state (no backend API calls)
- Report is generated as a `.txt` file (PDF generation would require additional library)
- Multiple clicks on "SIMULATE SPIKE" will re-trigger the same spike
- The spike persists until page refresh
