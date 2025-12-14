import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register fonts (optional, using default Helvetica for now for simplicity/speed)
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 5,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    col: {
        flexDirection: 'column',
    },
    infoItem: {
        width: '50%',
        marginBottom: 5,
    },
    infoLabel: {
        fontSize: 10,
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 12,
        color: '#1f2937',
    },
    hotelCard: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 5,
    },
    hotelName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    hotelAddress: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 5,
    },
    hotelImage: {
        width: '100%',
        height: 150,
        objectFit: 'cover',
        borderRadius: 5,
        marginBottom: 5,
    },
    dayContainer: {
        marginBottom: 15,
    },
    dayHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: 5,
        backgroundColor: '#f3f4f6',
        padding: 5,
        borderRadius: 3,
    },
    activityCard: {
        marginLeft: 10,
        marginBottom: 10,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: '#d1d5db',
    },
    activityName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    activityDetails: {
        fontSize: 10,
        color: '#4b5563',
        marginBottom: 2,
    },
    textSmall: {
        fontSize: 9,
        color: '#6b7280',
    },
});

interface TripPdfDocumentProps {
    tripData: any; // Using any for flexibility based on the provided JSON structure
}

const TripPdfDocument: React.FC<TripPdfDocumentProps> = ({ tripData }) => {
    const { trip_plan } = tripData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Trip to {trip_plan?.destination}</Text>
                    <Text style={styles.subtitle}>
                        From {trip_plan?.origin} • {trip_plan?.duration} • {trip_plan?.group_size}
                    </Text>
                </View>

                {/* Trip Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trip Summary</Text>
                    <View style={styles.row}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Budget</Text>
                            <Text style={styles.infoValue}>{trip_plan?.budget}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Duration</Text>
                            <Text style={styles.infoValue}>{trip_plan?.duration}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Travelers</Text>
                            <Text style={styles.infoValue}>{trip_plan?.group_size}</Text>
                        </View>
                    </View>
                </View>

                {/* Hotels */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hotels</Text>
                    {trip_plan?.hotels?.map((hotel: any, index: number) => (
                        <View key={index} style={styles.hotelCard}>
                            {/* Render base64 image if available */}
                            {hotel.hotel_image_base64 && (
                                <Image src={hotel.hotel_image_base64} style={styles.hotelImage} />
                            )}
                            <Text style={styles.hotelName}>{hotel.hotel_name}</Text>
                            <Text style={styles.hotelAddress}>{hotel.hotel_address}</Text>
                            <Text style={styles.textSmall}>Price: {hotel.price_per_night}</Text>
                            <Text style={styles.textSmall}>Rating: {hotel.rating} ⭐</Text>
                            <Text style={{ ...styles.textSmall, marginTop: 5 }}>{hotel.description}</Text>
                        </View>
                    ))}
                </View>

                {/* Itinerary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Itinerary</Text>
                    {trip_plan?.itinerary?.map((day: any, index: number) => (
                        <View key={index} style={styles.dayContainer}>
                            <Text style={styles.dayHeader}>Day {day.day}: {day.day_plan}</Text>
                            <Text style={{ ...styles.textSmall, marginBottom: 5 }}>Best time: {day.best_time_to_visit_day}</Text>

                            {day.activities?.map((activity: any, actIndex: number) => (
                                <View key={actIndex} style={styles.activityCard}>
                                    {/* Render place image if available */}
                                    {activity.place_image_base64 && (
                                        <Image src={activity.place_image_base64} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 5, marginBottom: 5 }} />
                                    )}
                                    <Text style={styles.activityName}>{activity.place_name}</Text>
                                    <Text style={styles.activityDetails}>{activity.place_details}</Text>
                                    <Text style={styles.textSmall}>Time: {activity.time_travel_each_location}</Text>
                                    <Text style={styles.textSmall}>Ticket: {activity.ticket_pricing}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Total Estimated Budget */}
                {trip_plan?.total_estimated_budget && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Estimated Budget</Text>
                        <View style={{
                            backgroundColor: '#f0fdf4',
                            padding: 15,
                            borderRadius: 5,
                            borderLeftWidth: 4,
                            borderLeftColor: '#22c55e'
                        }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#166534', marginBottom: 5 }}>
                                Total Estimated Budget
                            </Text>
                            <Text style={{ fontSize: 14, color: '#15803d' }}>
                                {trip_plan.total_estimated_budget}
                            </Text>
                            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
                                *Excluding flights
                            </Text>
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default TripPdfDocument;

