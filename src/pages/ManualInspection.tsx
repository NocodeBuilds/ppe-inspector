
// Inside ManualInspection.tsx

const onSubmit = async (data: any) => {
  try {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to perform inspections',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSubmittedSerialNumber(data.serialNumber);

    console.log("Form data:", data);

    // Check if the PPE exists - improved query with error handling
    const serialNumberQuery = data.serialNumber ? data.serialNumber.trim() : '';
    
    if (!serialNumberQuery) {
      throw new Error('Serial number is required');
    }
    
    console.log("Searching for PPE with serial number:", serialNumberQuery);
    
    const { data: ppeData, error: ppeError } = await supabase
      .from('ppe_items')
      .select('*')
      .or(`serial_number.eq.${serialNumberQuery},id.eq.${serialNumberQuery}`);

    if (ppeError) {
      console.error("Error checking PPE existence:", ppeError);
      throw ppeError;
    }

    if (ppeData && ppeData.length > 0) {
      // PPE exists, redirect to inspection form
      const ppeItem = ppeData[0];
      console.log("PPE found:", ppeItem);
      navigate(`/inspect/${ppeItem.id}`);
      return;
    }

    // PPE doesn't exist, create a new one
    if (!data.type) {
      toast({
        title: 'Error',
        description: 'PPE type is required for new equipment',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Set default dates if not provided
    const currentDate = new Date().toISOString().split('T')[0];
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 5);
    const defaultExpiryString = defaultExpiryDate.toISOString().split('T')[0];

    const manufacturingDate = data.manufacturingDate || currentDate;
    const expiryDate = data.expiryDate || defaultExpiryString;

    // Calculate next inspection date (1 month from today)
    const nextInspection = new Date();
    nextInspection.setMonth(nextInspection.getMonth() + 1);

    console.log("Creating new PPE with data:", {
      serial_number: data.serialNumber,
      type: data.type,
      brand: data.brand || 'Unknown',
      model_number: data.modelNumber || 'Unknown',
      manufacturing_date: manufacturingDate,
      expiry_date: expiryDate,
      created_by: user.id,
    });

    // Insert new PPE with improved error handling
    const { data: newPpeData, error: insertError } = await supabase
      .from('ppe_items')
      .insert({
        serial_number: data.serialNumber,
        type: data.type,
        brand: data.brand || 'Unknown',
        model_number: data.modelNumber || 'Unknown',
        manufacturing_date: manufacturingDate,
        expiry_date: expiryDate,
        status: 'active',
        next_inspection: nextInspection.toISOString(),
        created_by: user.id,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Error inserting new PPE:", insertError);
      throw insertError;
    }

    if (!newPpeData || !newPpeData.id) {
      throw new Error('Failed to create new PPE item');
    }

    console.log("New PPE created with ID:", newPpeData.id);
    navigate(`/inspect/${newPpeData.id}`);

  } catch (error: any) {
    console.error('Error in manual inspection:', error);
    setError(error.message || 'An unexpected error occurred');
    toast({
      title: 'Error',
      description: error.message || 'Failed to process inspection request',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
