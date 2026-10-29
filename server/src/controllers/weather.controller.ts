import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service.js';
import { AppError } from '../middleware/errorHandler.js';

export const getWeatherHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const latStr = req.query.lat as string;
    const lonStr = req.query.lon as string;
    const locationName = (req.query.locationName as string) || 'Farm Area';
    const stateName = req.query.stateName as string;

    // Default to Hyderabad/Guntur coordinates if not provided (Andhra / Telangana agricultural hub)
    const lat = latStr ? parseFloat(latStr) : 16.3067;
    const lon = lonStr ? parseFloat(lonStr) : 80.4365;

    if (isNaN(lat) || isNaN(lon)) {
      throw new AppError('Invalid latitude or longitude numbers', 400);
    }

    const weather = await weatherService.getWeather(lat, lon, locationName, stateName);

    res.json({
      success: true,
      data: weather,
    });
  } catch (err) {
    next(err);
  }
};

export const searchLocationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }

    const locations = await weatherService.searchLocations(query);

    res.json({
      success: true,
      data: locations,
    });
  } catch (err) {
    next(err);
  }
};

