"use client";
import React, { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useTripDetails } from '@/app/Provider';
import { Activity, Itinerary } from './ChatBox';

function GlobalMap() {

    const mapContainerRef = useRef(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    // @ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = useTripDetails();

    useEffect(() => {
        mapboxgl.accessToken = process?.env?.NEXT_PUBLIC_MAP_BOX_API_KEY;
        const map = new mapboxgl.Map({
            container: mapContainerRef?.current ?? '', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 1.7, // starting zoom
            projection: 'globe'
        });
        const markers: mapboxgl.Marker[] = [];

        if (tripDetailInfo?.itinerary) {
            tripDetailInfo?.itinerary.map((itinerary: Itinerary, index: number) => {
                itinerary.activities.map((activity: Activity, index: number) => {
                    if (activity?.geo_coordinates?.latitude && activity?.geo_coordinates?.longitude) {
                        const marker = new mapboxgl.Marker({ color: 'red' })
                            .setLngLat([activity?.geo_coordinates?.longitude, activity?.geo_coordinates?.latitude])
                            .setPopup(
                                new mapboxgl.Popup({ offset: 25 }).setText(activity.place_name)
                            )
                            .addTo(mapRef.current!);
                            markers.push(marker);
                            mapRef.current!.flyTo({
                                center: [activity?.geo_coordinates?.longitude, activity?.geo_coordinates?.latitude],
                                zoom: 10,
                                essential:true
                            })
                    }
                })

            })
        }
        return () => {
            markers.forEach(marker => marker.remove());
        };
    }, [tripDetailInfo])
    return (
        <div>
            <div ref={mapContainerRef} style={{
                width: '95%',
                height: '85vh',
                borderRadius: '20px'
            }}>

            </div>
        </div>
    )
}

export default GlobalMap