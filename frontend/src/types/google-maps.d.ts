declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        LatLng: any;
        InfoWindow: any;
        event: any;
        places: any;
      };
    };
  }
}

export {};
