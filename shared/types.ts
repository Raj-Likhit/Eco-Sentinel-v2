// SHARED TYPES - The "Contract"
export interface PollutionData {
  pm25: number;      
  pm10: number;      
  no2: number;       
  timestamp: string; 
  location: string;  
}

export interface PollutionAlert {
  id: string;
  severity: "LOW" | "MEDIUM" | "CRITICAL"; 
  summary: string;   
  ai_analysis: {
    root_cause: string;       
    confidence_score: number; 
    recommended_actions: string[]; 
  };
  satellite_evidence?: {
    has_plume: boolean;
    image_url: string; 
  };
  attribution?: {
    suspect_name: string; 
    distance_km: number;
  };
}

export interface ApiResponse {
  status: "success" | "error";
  data?: PollutionData | PollutionAlert;
  message?: string;
}