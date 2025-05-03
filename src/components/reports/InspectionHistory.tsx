
// Modify the process for retrieving profile data to handle potential errors:

const formattedInspections = (data || []).map(item => {
  // Default values for missing data, handle potential null/undefined or error cases
  const inspector_name = item.profiles?.full_name || 'Unknown';
  const ppe_type = item.ppe_items?.type || 'Unknown';
  const ppe_serial = item.ppe_items?.serial_number || 'Unknown';
  const ppe_brand = item.ppe_items?.brand || 'Unknown';
  const ppe_model = item.ppe_items?.model_number || 'Unknown';
  
  return {
    id: item.id,
    date: item.date,
    type: item.type,
    overall_result: item.overall_result,
    inspector_name,
    ppe_type,
    ppe_serial,
    ppe_brand,
    ppe_model
  };
});
