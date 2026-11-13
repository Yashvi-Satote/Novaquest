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

export const LAUNCH_VIDEO = {
  src: "/videos/surveyor5-launch.m4v",
  type: "video/mp4",                     // .m4v is an MP4 container — browsers accept this MIME type
  part1: { start: 0,  end: 71 },         // 0:00 -> 1:11 (stops right before liftoff)
  part2: { start: 71, end: HELIUM_T },   // 1:11 -> helium leak moment
  part3: { start: HELIUM_T, end: null }, // resumes after Task 3 solved, plays to end
};

export default LAUNCH_VIDEO;
