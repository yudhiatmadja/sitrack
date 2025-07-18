import 'leaflet';

declare module 'leaflet' {
    interface MarkerClusterGroupOptions {
        showCoverageOnHover?: boolean;
        zoomToBoundsOnClick?: boolean;
        spiderfyOnMaxZoom?: boolean;
        removeOutsideVisibleBounds?: boolean;
        animate?: boolean;
        animateAddingMarkers?: boolean;
        disableClusteringAtZoom?: number;
        maxClusterRadius?: number | ((zoom: number) => number);
    }

    // mendeklarasikan bahwa sekarang ada fungsi `markerClusterGroup`
    // di dalam namespace `L`.
    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;

    // Kita juga perlu mendefinisikan tipe `MarkerClusterGroup` itu sendiri
    // agar bisa digunakan di tempat lain.
    class MarkerClusterGroup extends FeatureGroup {
        // bisa menambahkan metode spesifik dari MarkerClusterGroup di sini jika perlu
        // Contoh:
        // addLayer(layer: Layer): this;
        // removeLayer(layer: Layer): this;
        // clearLayers(): this;
    }
}