/**
 * NASA/JPL Surveyor 5 Launch Video Configuration
 *
 * Single video file controlled via currentTime segments.
 * Reference: https://www.jpl.nasa.gov/videos/surveyor-5-launches/
 * File: /public/videos/surveyor5-launch.m4v  (served as /videos/surveyor5-launch.m4v)
 * Total duration: 105.72 s  (1:45)
 */

// HELIUM_T: timestamp in seconds where the helium leak anomaly is detected in Part 2.
// Video duration = 105.72 s. Set this to any value between 71 and ~104.
// Placeholder: 95 s (1:35) — edit this once you've watched the video.
export const HELIUM_T = 95;
export const VIDEO_TOTAL_DURATION = 105.72; // 1:45.72
export const VIDEO_STOP_BEFORE_END = 3;     // Stop 3 seconds before video ends (~102.72s)

export const LAUNCH_VIDEO_CAPTIONS = [
  {
    start: 5.2,
    end: 11.2,
    speaker: "NARRATOR",
    text: "The fifth Surveyor spacecraft, SC-5, was delivered to Cape Kennedy in June 1967.",
  },
  {
    start: 11.8,
    end: 24.2,
    speaker: "NARRATOR",
    text: "This was the first spacecraft to be equipped with the alpha-scattering instrument, designed to determine the relative proportion of various chemical elements in the lunar soil.",
  },
  {
    start: 24.8,
    end: 30.0,
    speaker: "NARRATOR",
    text: "Several particle detectors are strategically located under the hood of the instrument.",
  },
  {
    start: 30.2,
    end: 37.8,
    speaker: "NARRATOR",
    text: "The sensor head of the device also contained instruments designed to detect protons produced in the sample by the alpha particles.",
  },
  {
    start: 38.2,
    end: 44.0,
    speaker: "NARRATOR",
    text: "In addition to the alpha-scattering unit, SC-5 carried a magnet assembly.",
  },
  {
    start: 44.5,
    end: 51.8,
    speaker: "NARRATOR",
    text: "Mounted on footpad number two, it consisted of two bars: one magnetic, the other non-magnetic.",
  },
  {
    start: 52.2,
    end: 63.5,
    speaker: "NARRATOR",
    text: "By observing with the TV camera the extent to which material adheres to the two bars, it is possible to determine the presence and nature of magnetic material in the soil.",
  },
  {
    start: 64.5,
    end: 70.8,
    speaker: "NARRATOR",
    text: "In early September, SC-5 was transported to the launch pad.",
  },
  {
    start: 74.0,
    end: 77.0,
    speaker: "NARRATOR",
    text: "Liftoff occurred on September 8th.",
  },
  {
    start: 77.2,
    end: 80.5,
    speaker: "NARRATOR",
    text: "The launch was extremely accurate.",
  },
  {
    start: 80.8,
    end: 90.0,
    speaker: "NARRATOR",
    text: "So accurate that even without mid-course correction, Surveyor 5 would have landed only 26 miles from its planned target area in the Sea of Tranquillity.",
  },
  {
    start: 90.5,
    end: 100.5,
    speaker: "NARRATOR",
    text: "To reduce this small error, Surveyor's vernier engines were fired for 14 seconds about 18 hours after launch to reduce landing velocity.",
  },
];

export const LAUNCH_VIDEO = {
  src: "/videos/surveyor5-launch.m4v",
  type: "video/mp4",                     // .m4v is an MP4 container — browsers accept this MIME type
  part1: { start: 0,  end: 71 },         // 0:00 -> 1:11 (stops right before liftoff)
  part2: { start: 71, end: HELIUM_T },   // 1:11 -> helium leak moment
  part3: { start: HELIUM_T, end: null }, // resumes after Task 3 solved, plays to end
};

export default LAUNCH_VIDEO;
