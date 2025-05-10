import { parseDate, compareDates } from './dateHelpers';

const zodiac = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const getZodiacIndex = (sign) => zodiac.indexOf(sign);

export const calculateSadeSatiPeriods = (moonSign, transitData, birthDate) => {
  // Debug logging
  console.log('calculateSadeSatiPeriods input:', { moonSign, transitData: transitData?.length, birthDate });

  const moonIndex = getZodiacIndex(moonSign);
  const phase1 = (moonIndex + 11) % 12; // 12th house from Moon
  const phase2 = moonIndex;              // Moon sign
  const phase3 = (moonIndex + 1) % 12;   // 2nd house from Moon

  // Debug logging
  console.log('Phase indices:', { phase1, phase2, phase3 });
  console.log('Corresponding signs:', {
    phase1: zodiac[phase1],
    phase2: zodiac[phase2],
    phase3: zodiac[phase3]
  });

  const now = new Date();
  const birth = parseDate(birthDate);
  const hundredYearsLater = new Date(birth);
  hundredYearsLater.setFullYear(birth.getFullYear() + 100);

  const past = [];
  const current = [];
  const future = [];
  let tempRange = [];

  for (let i = 0; i < transitData.length; i++) {
    const { startDate, zodiacSign } = transitData[i];
    const signIndex = getZodiacIndex(zodiacSign);
    const nextDateStr = transitData[i + 1]?.startDate;
    const nextDate = nextDateStr ? parseDate(nextDateStr) : null;
    const start = parseDate(startDate);

    // Debug logging for each transit
    console.log('Processing transit:', {
      startDate,
      zodiacSign,
      signIndex,
      nextDateStr,
      isRelevantPhase: [phase1, phase2, phase3].includes(signIndex)
    });

    // Skip if the period ends before birth
    if (nextDate && nextDate < birth) {
      continue;
    }

    // Skip if the period starts after 100 years from birth
    if (start > hundredYearsLater) {
      break;
    }

    if ([phase1, phase2, phase3].includes(signIndex)) {
      let phaseName =
        signIndex === phase1 ? "First Phase (12th from Moon)" :
        signIndex === phase2 ? "Second Phase (Moon sign)" :
        "Third Phase (2nd from Moon)";

      // Adjust end date if it goes beyond 100 years
      let endDate = nextDateStr;
      if (nextDate && nextDate > hundredYearsLater) {
        const hundredYearStr = `${hundredYearsLater.getMonth() + 1}/${hundredYearsLater.getDate()}/${hundredYearsLater.getFullYear()}`;
        endDate = hundredYearStr;
      }

      tempRange.push({
        phase: phaseName,
        from: startDate,
        to: endDate || "Ongoing"
      });

      // Debug logging for phase addition
      console.log('Added phase:', {
        phase: phaseName,
        from: startDate,
        to: endDate || "Ongoing",
        tempRangeLength: tempRange.length
      });

      if (tempRange.length === 3 || i === transitData.length - 1 || 
          (nextDate && nextDate > hundredYearsLater)) {
        const combined = {
          phase: "Full Sade Sati",
          from: tempRange[0].from,
          to: tempRange[tempRange.length - 1].to,
          details: [...tempRange]
        };

        // Debug logging for period categorization
        console.log('Categorizing period:', {
          start,
          now,
          birth,
          periodStart: parseDate(combined.from),
          periodEnd: parseDate(combined.to)
        });

        // Categorize based on current date and ensure it's after birth
        if (start >= birth) {
          const periodStart = parseDate(combined.from);
          const periodEnd = parseDate(combined.to);

          // A period is current if:
          // 1. It has started (now >= periodStart)
          // 2. It hasn't ended yet (now < periodEnd)
          if (now >= periodStart && now < periodEnd) {
            current.push(combined);
          }
          // A period is in the future if it hasn't started yet
          else if (now < periodStart) {
            future.push(combined);
          }
          // A period is in the past if it has ended
          else if (now >= periodEnd) {
            past.push(combined);
          }
        }
        tempRange = [];
      }
    } else {
      tempRange = [];
    }
  }

  const result = {
    past: past.sort((a, b) => compareDates(b.from, a.from)),
    current,
    future: future.sort((a, b) => compareDates(a.from, b.from))
  };

  // Debug logging for final result
  console.log('Final periods:', {
    pastCount: result.past.length,
    currentCount: result.current.length,
    futureCount: result.future.length,
    periods: {
      past: result.past,
      current: result.current,
      future: result.future
    }
  });

  return result;
}; 