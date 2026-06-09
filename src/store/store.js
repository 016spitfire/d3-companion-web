import { createSlice, configureStore } from '@reduxjs/toolkit';
import seasonJourneyData from '../data/seasonJourneyData';

export const reduxSlice = createSlice({
  name: 'reduxSlice',
  initialState: {
    value: {
      currentParagons: 0,
      seasonParagon: 0,
      totalParagons: 0,
      goalParagons: 0,
      weeks: 0,
      daysPerWeek: 0,
      goalData: [],
      startDate: null,
      width: typeof window !== 'undefined' ? window.innerWidth : 480,
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
      journeyProgress: seasonJourneyData,
      currentChapter: seasonJourneyData[0].chapter,
    },
  },
  reducers: {
    getDims: (state, action) => {
      state.value = { ...state.value, width: action.payload.width, height: action.payload.height };
    },
    getSeasonJourneyProgress: (state, action) => {
      state.value = { ...state.value, journeyProgress: action.payload };
    },
    getCurrentChapter: (state, action) => {
      state.value = { ...state.value, currentChapter: action.payload };
    },
    getSeasonalParagon: (state, action) => {
      state.value = { ...state.value, seasonParagon: action.payload };
    },
    getCurrentParagon: (state, action) => {
      state.value = { ...state.value, currentParagons: action.payload };
    },
    getTotalParagons: (state, action) => {
      state.value = { ...state.value, totalParagons: action.payload };
    },
    getGoalParagons: (state, action) => {
      state.value = { ...state.value, goalParagons: action.payload };
    },
    getWeeks: (state, action) => {
      state.value = { ...state.value, weeks: action.payload };
    },
    getDaysPerWeek: (state, action) => {
      state.value = { ...state.value, daysPerWeek: action.payload };
    },
    getGoalData: (state, action) => {
      state.value = { ...state.value, goalData: action.payload };
    },
    setSavedData: (state, action) => {
      const journeyData = seasonJourneyData.map((d) => {
        const savedItem = action.payload.journeyProgress?.find((datum) => datum.key === d.key);
        return savedItem ? { ...d, completed: savedItem.completed } : d;
      });
      state.value = { ...state.value, ...action.payload, journeyProgress: journeyData };
    },
    getNewStartDate: (state, action) => {
      state.value = { ...state.value, startDate: action.payload };
    },
  },
});

export const {
  getDims,
  getSeasonalParagon,
  getCurrentParagon,
  getTotalParagons,
  setSavedData,
  getGoalParagons,
  getWeeks,
  getDaysPerWeek,
  getGoalData,
  getNewStartDate,
  getSeasonJourneyProgress,
  getCurrentChapter,
} = reduxSlice.actions;

export const setDims = () => (dispatch) => {
  dispatch(getDims({ width: window.innerWidth, height: window.innerHeight }));
};

const saveData = (currentState) => {
  try {
    const jsonValue = JSON.stringify({
      currentParagons: currentState.currentParagons,
      seasonParagon: currentState.seasonParagon,
      totalParagons: currentState.totalParagons,
      goalParagons: currentState.goalParagons,
      weeks: currentState.weeks,
      daysPerWeek: currentState.daysPerWeek,
      goalData: currentState.goalData,
      startDate: currentState.startDate,
      journeyProgress: currentState.journeyProgress,
      currentChapter: currentState.currentChapter,
    });
    localStorage.setItem('DIABLO_3_COMPANION_SAVE_DATA', jsonValue);
  } catch (e) {
    console.log('Error saving data', e);
  }
};

export const setSeasonalParagon = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, seasonParagon: val });
  dispatch(getSeasonalParagon(val));
};
export const setCurrentParagon = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, currentParagons: val });
  dispatch(getCurrentParagon(val));
};
export const setTotalParagons = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, totalParagons: val });
  dispatch(getTotalParagons(val));
};
export const setGoalParagons = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, goalParagons: val });
  dispatch(getGoalParagons(val));
};
export const setWeeks = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, weeks: val });
  dispatch(getWeeks(val));
};
export const setDaysPerWeek = (val, currentState) => (dispatch) => {
  const fixedVal = Number(val) > 7 ? 7 : val;
  saveData({ ...currentState, daysPerWeek: fixedVal });
  dispatch(getDaysPerWeek(fixedVal));
};
export const setGoalData = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, goalData: val });
  dispatch(getGoalData(val));
};
export const setNewStartDate = (val, currentState) => (dispatch) => {
  saveData({ ...currentState, startDate: val });
  dispatch(getNewStartDate(val));
};
export const setJourneyProgress = ({ val, currentState }) => (dispatch) => {
  const newVal = currentState.journeyProgress.map((d) =>
    val.key === d.key ? { ...d, completed: !d.completed } : d
  );
  saveData({ ...currentState, journeyProgress: newVal });
  dispatch(getSeasonJourneyProgress(newVal));
};
export const setCurrentChapter = ({ val, currentState }) => (dispatch) => {
  saveData({ ...currentState, currentChapter: val });
  dispatch(getCurrentChapter(val));
};

export const getSavedData = () => (dispatch) => {
  try {
    const value = localStorage.getItem('DIABLO_3_COMPANION_SAVE_DATA');
    if (value !== null) {
      dispatch(setSavedData(JSON.parse(value)));
    }
  } catch (e) {
    console.log('Error loading data', e);
  }
};

export const store = configureStore({
  reducer: { store: reduxSlice.reducer },
});

export default reduxSlice.reducer;
export const selectReduxSlice = (state) => state.store.value;
