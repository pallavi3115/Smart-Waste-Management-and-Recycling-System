// @desc Optimize route stops (Smart Sorting)
exports.optimizeRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findById(routeId)
      .populate('stops.bin');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    let stops = route.stops;

    // 🔥 Step 1: Priority (high fill first)
    stops.sort((a, b) => {
      return (b.binDetails.expectedFillLevel || 0) - 
             (a.binDetails.expectedFillLevel || 0);
    });

    // 🔥 Step 2: Nearest neighbor (distance)
    const optimized = [];
    let current = stops.shift(); // start from first

    optimized.push(current);

    while (stops.length > 0) {
      let nearestIndex = 0;
      let minDist = Infinity;

      stops.forEach((stop, i) => {
        const dist = calculateDistance(
          current.binDetails.location,
          stop.binDetails.location
        );

        if (dist < minDist) {
          minDist = dist;
          nearestIndex = i;
        }
      });

      current = stops.splice(nearestIndex, 1)[0];
      optimized.push(current);
    }

    // update stop order
    route.stops = optimized;
    await route.save();

    res.json({
      success: true,
      data: route,
      message: "Route optimized successfully 🚀"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};