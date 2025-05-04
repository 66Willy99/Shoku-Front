import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Icon = ({ color = '#f3d5bc', size = 140 }) => {
  return (
    <Svg
      width={size}
      height={size * (135.82219 / 140.98717)} // Mantener la proporción original
      viewBox="10 10 200 200"
      fill="none"
    >
      <Path
        d="M104.75731,105.06093 V80.98536 81.233563 Z"
        stroke={color}
        strokeWidth="7.16446"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M37.841286,104.89033 H171.26752 Z"
        stroke={color}
        strokeWidth="7.39191"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M171.35844,104.23231 C148.29591,97.274904 107.83986,58.751462 104.87651,47.799984"
        stroke={color}
        strokeWidth="7.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M37.771263,104.56624 C60.83379,97.608829 101.28984,59.085387 104.25319,48.133909"
        stroke={color}
        strokeWidth="7.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m61.187169,104.95215 v74.88773 z"
        stroke={color}
        strokeWidth="7.46383"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />
      <Path
        d="M144.55114,125.18355 H66.128218 Z"
        stroke={color}
        strokeWidth="7.63797"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M144.04982,143.93308 H65.626901 Z"
        stroke={color}
        strokeWidth="7.63797"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M124.41102,179.92217 V145.04631 Z"
        stroke={color}
        strokeWidth="7.9085"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />
      <Path
        d="m148.16707,105.1342 v57.42439 a10.603608,10.603608 45 0 0 10.60361,10.60361 h5.24382"
        stroke={color}
        strokeWidth="7.473"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />
    </Svg>
  );
};

export default Icon;