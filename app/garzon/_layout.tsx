import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import Icon from '../../components/ui/Icon';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "@/constants/config";
import { SvgXml } from "react-native-svg";
import Swal from 'sweetalert2';
import { useNotifications } from '../../hooks/useNotifications';

// Manejo global de errores
const handleError = (error: any, context: string) => {
    console.error(`Error en ${context}:`, error);
    // Evitar mostrar alertas si es un error de conexión común
    if (error?.name !== 'AbortError' && error?.code !== 'NETWORK_ERROR') {
        console.warn(`Error no crítico en ${context}:`, error.message || error);
    }
};

const mesaDisponibleSVG = `
<svg fill="#000000" height="60px" width="60px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-153.3 -153.3 817.60 817.60" xml:space="preserve" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
<g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
<rect x="-153.3" y="-153.3" width="817.60" height="817.60" rx="408.8" fill="#c6d16c" strokewidth="0"></rect>
</g>
<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="1.022"></g>
<g id="SVGRepo_iconCarrier">
<g>
<path d="M391.5,0c-4.142,0-7.5,3.358-7.5,7.5v120c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5 S352,3.358,352,7.5v120c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5S320,3.358,320,7.5v120 c0,4.687-3.813,8.5-8.5,8.5s-8.5-3.813-8.5-8.5V7.5c0-4.142-3.358-7.5-7.5-7.5S288,3.358,288,7.5v160 c0,12.958,10.542,23.5,23.5,23.5c4.687,0,8.5,3.813,8.5,8.5v73.409c-13.759,3.374-24,15.806-24,30.591v160 c0,26.191,21.309,47.5,47.5,47.5s47.5-21.309,47.5-47.5v-160c0-14.785-10.241-27.216-24-30.591V199.5c0-4.687,3.813-8.5,8.5-8.5 c12.958,0,23.5-10.542,23.5-23.5V7.5C399,3.358,395.642,0,391.5,0z M376,303.5v160c0,17.92-14.58,32.5-32.5,32.5 S311,481.42,311,463.5v-160c0-9.098,7.402-16.5,16.5-16.5h32C368.598,287,376,294.402,376,303.5z M375.5,176 c-12.958,0-23.5,10.542-23.5,23.5V272h-17v-72.5c0-12.958-10.542-23.5-23.5-23.5c-4.687,0-8.5-3.813-8.5-8.5v-18.097 c2.638,1.027,5.503,1.597,8.5,1.597c6.177,0,11.801-2.399,16-6.31c4.199,3.911,9.823,6.31,16,6.31s11.801-2.399,16-6.31 c4.199,3.911,9.823,6.31,16,6.31c2.997,0,5.862-0.57,8.5-1.597V167.5C384,172.187,380.187,176,375.5,176z"></path>
<path d="M183.5,0c-20.479,0-38.826,11.623-51.663,32.728C118.86,54.064,112,84.07,112,119.5c0,25.652,13.894,49.464,36.26,62.144 c7.242,4.105,11.74,12.106,11.74,20.88v70.385c-13.759,3.374-24,15.806-24,30.591v160c0,26.191,21.309,47.5,47.5,47.5 s47.5-21.309,47.5-47.5v-160c0-14.785-10.241-27.216-24-30.591v-70.385c0-8.774,4.499-16.775,11.74-20.88 C241.106,168.964,255,145.152,255,119.5c0-35.43-6.86-65.436-19.837-86.772C222.326,11.623,203.979,0,183.5,0z M216,303.5v160 c0,17.92-14.58,32.5-32.5,32.5S151,481.42,151,463.5v-160c0-9.098,7.402-16.5,16.5-16.5h32C208.598,287,216,294.402,216,303.5z M211.343,168.595C199.412,175.359,192,188.36,192,202.524V272h-17v-69.476c0-14.164-7.412-27.165-19.342-33.929 C137.981,158.574,127,139.762,127,119.5c0-32.68,6.104-59.99,17.653-78.978C154.809,23.826,168.242,15,183.5,15 s28.691,8.826,38.847,25.522C233.896,59.51,240,86.82,240,119.5C240,139.762,229.019,158.574,211.343,168.595z"></path>
<path d="M191.5,304c-4.142,0-7.5,3.358-7.5,7.5v16c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-16 C199,307.358,195.642,304,191.5,304z"></path>
<path d="M191.5,352c-4.142,0-7.5,3.358-7.5,7.5v72c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-72 C199,355.358,195.642,352,191.5,352z"></path>
<path d="M351.5,304c-4.142,0-7.5,3.358-7.5,7.5v16c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-16 C359,307.358,355.642,304,351.5,304z"></path>
<path d="M351.5,352c-4.142,0-7.5,3.358-7.5,7.5v72c0,4.142,3.358,7.5,7.5,7.5s7.5-3.358,7.5-7.5v-72 C359,355.358,355.642,352,351.5,352z"></path>
</g>
</g>
</svg>
`;

const mesaOcupadaSVG = `
<svg viewBox="-180 -180 960.00 960.00" version="1.1" width="60px" height="60px" fill="#000000" xmlns="http://www.w3.org/2000/svg">
<g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
<rect x="-180" y="-180" width="960.00" height="960.00" rx="480" fill="#fa3e29" strokewidth="0"></rect>
</g>
<g id="SVGRepo_iconCarrier">
<g id="g10449" transform="matrix(0.95173205,0,0,0.95115787,13.901174,12.168794)" style="stroke-width:1.05103">
<path style="color:#000000;fill:#000000;stroke-width:1.05103;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers" d="m 248.07279,-12.793664 c -72.13241,0 -131.33949,59.250935 -131.33949,131.392074 0,38.92115 17.25502,74.07152 44.45432,98.20884 C 58.500207,254.84854 -14.606185,358.21398 -14.606185,477.846 a 35.037921,35.037921 0 0 0 35.034809,35.03543 H 188.95771 c 6.88866,-25.46243 17.91968,-49.15043 32.45932,-70.0688 H 58.235927 C 73.730605,344.39181 153.38526,271.2598 248.07279,271.2598 c 13.12286,0 25.94065,1.45153 38.35524,4.13353 4.26325,-42.80875 34.59589,-78.30933 74.73011,-90.32371 11.57931,-19.5408 18.25414,-42.27592 18.25414,-66.47121 0,-72.141139 -59.20709,-131.392074 -131.33949,-131.392074 z m 0,70.068794 c 34.24293,0 61.26987,27.028459 61.26987,61.32328 0,34.29482 -27.02694,61.3274 -61.26987,61.3274 -34.24293,0 -61.27192,-27.03258 -61.27192,-61.3274 0,-34.294821 27.02899,-61.32328 61.27192,-61.32328 z" id="path295"></path>
<path id="path295-3" style="color:#000000;fill:#000000;stroke-width:1.05103;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers" d="m 405.68024,197.47637 c -57.70598,0 -105.07159,47.40151 -105.07159,105.11449 0,31.13694 13.80343,59.25664 35.56289,78.56652 -82.15001,30.43306 -140.63449,113.12556 -140.63449,208.83127 a 28.030337,28.030337 0 0 0 28.0273,28.0278 h 182.11589 182.11452 a 28.030337,28.030337 0 0 0 28.0286,-28.0278 c 0,-95.70539 -58.4835,-178.39795 -140.63307,-208.83127 21.75947,-19.30988 35.56153,-47.42958 35.56153,-78.56652 0,-57.71298 -47.3656,-105.11449 -105.07158,-105.11449 z m 0,56.05559 c 27.39437,0 49.01562,21.62301 49.01562,49.0589 0,27.43588 -21.62125,49.06164 -49.01562,49.06164 -27.39437,0 -49.017,-21.62576 -49.017,-49.06164 0,-27.43589 21.62263,-49.0589 49.017,-49.0589 z m 0,171.18664 c 75.7501,0 139.47372,58.50552 151.86952,137.24226 H 405.68024 253.81075 C 266.2065,483.22412 329.93014,424.7186 405.68024,424.7186 Z"></path>
</g>
</g>
</svg>
`;

const mesaPagadaSVG = `<svg height="150px" width="150px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-128 -128 768.00 768.00" xml:space="preserve" fill="#000000" transform="rotate(-45)"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-128" y="-128" width="768.00" height="768.00" rx="384" fill="#7ed0ec" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#000000;} </style> <g> <path class="st0" d="M509.556,206.762c0.11-2.05,0.19-4.092,0.19-6.12c0.008-30.611-11.531-58.356-30.764-78.398 c-19.204-20.064-46.234-32.426-76.422-32.405c-29.458-0.007-53.534,4.894-75.787,9.569c-22.304,4.69-42.733,9.095-66.145,9.088 c-23.412,0-43.214-4.384-64.964-9.08c-21.698-4.668-45.271-9.584-74.73-9.576c-31.406,0.008-60.412,13.245-81.943,34.345 c-21.428,20.998-35.665,49.954-37.715,82.045H1.262C1.233,206.514,0,218.577,0,236.766c0.03,24.769,2.21,60.814,13.318,94.393 c5.587,16.79,13.435,33.026,24.755,46.766c11.283,13.727,26.242,24.886,45.052,30.75c24.973,7.833,41.318,10.707,57.378,10.685 c13.158-0.015,25.419-1.795,42.303-3.662c16.914-1.881,38.685-3.96,70.952-4.814l0.627-0.014l-0.605,0.014 c1.437-0.036,2.881-0.058,4.34-0.058c17.636-0.008,36.686,2.706,56.686,5.557c20.006,2.83,40.968,5.77,62.615,5.777 c12.611,0,25.469-1.014,38.444-3.684c20.86-4.259,37.86-13.865,50.953-26.578c19.693-19.102,30.756-44.578,37.138-70.113 c6.36-25.586,8.038-51.492,8.045-72.352C512,227.248,510.074,210.794,509.556,206.762z M19.853,208.139l0.007-0.32l3.727,0.226 c1.584-26.446,13.348-50.478,31.086-67.859c17.76-17.381,41.252-27.949,66.261-27.941c26.964,0.007,48.393,4.42,70.011,9.08 c21.567,4.632,43.404,9.576,69.682,9.576c26.278-0.007,48.611-4.93,70.747-9.569c22.18-4.66,44.221-9.08,71.185-9.088 c24.069,0.022,45.024,9.664,60.244,25.505c15.193,15.856,24.521,37.912,24.536,62.892c0,2.006-0.066,4.019-0.182,6.068 l-0.066,1.116l0.153,1.109l0.022,0.138c0.117,0.868,0.759,5.923,1.334,13.719c-4.521,21.064-15.17,39.99-29.925,54.439 c-18.387,18.008-42.798,29.014-68.88,29.014c-27.38-0.008-49.159-4.5-70.792-9.161c-21.596-4.646-43.09-9.496-68.895-9.496 c-25.804,0-47.816,4.843-69.982,9.489c-22.194,4.661-44.578,9.168-71.951,9.168c-25.082-0.015-47.05-10.116-62.936-26.658 c-11.006-11.48-18.942-26.111-22.836-42.616v-0.205c0-8.584,0.292-15.718,0.584-20.669c0.146-2.48,0.284-4.406,0.394-5.704 l0.124-1.445l0.044-0.43L19.853,208.139z M475.072,338.723c-5.747,14.332-13.544,27.132-23.835,37.08 c-10.32,9.949-23.062,17.235-39.896,20.736c-11.196,2.298-22.501,3.217-33.922,3.217c-19.598,0.008-39.516-2.721-59.472-5.558 c-19.955-2.815-39.939-5.762-59.829-5.776c-1.648,0-3.311,0.022-4.974,0.066l-0.306,0.014c-32.755,0.868-55.322,3.013-72.512,4.931 c-17.264,1.933-28.875,3.537-39.823,3.523c-13.296-0.022-26.65-2.166-50.682-9.664c-14.368-4.522-25.41-12.691-34.462-23.616 c-13.537-16.345-22.056-39.195-26.87-62.506c-1.619-7.768-2.8-15.55-3.705-23.15c2.968,4.186,6.141,8.22,9.671,11.903 c18.54,19.364,44.556,31.275,73.723,31.26c29.043,0,52.776-4.821,75.021-9.489c22.275-4.683,43.018-9.168,66.911-9.168 s44.031,4.478,65.752,9.161c21.684,4.668,44.892,9.496,73.935,9.496c30.341-0.008,58.436-12.8,79.331-33.281 c7.812-7.651,14.631-16.396,20.218-25.972C488.485,285.984,484.868,314.435,475.072,338.723z"></path> <path class="st0" d="M69.566,192.334c4.872,3.501,11.305,5.536,18.344,5.543c7.038-0.008,13.471-2.042,18.335-5.543 c4.836-3.465,8.235-8.664,8.235-14.674c0-6.017-3.399-11.225-8.235-14.696c-4.872-3.508-11.304-5.536-18.335-5.543 c-7.038,0.007-13.472,2.035-18.344,5.543c-4.836,3.471-8.234,8.679-8.234,14.696C61.332,183.67,64.73,188.87,69.566,192.334z M73.942,169.017c3.399-2.472,8.388-4.136,13.968-4.128c5.579-0.008,10.56,1.656,13.959,4.128c3.428,2.502,5.142,5.543,5.142,8.643 c0,3.078-1.714,6.119-5.142,8.621c-3.399,2.464-8.388,4.135-13.959,4.128c-5.58,0.008-10.569-1.663-13.968-4.128 c-3.427-2.502-5.141-5.543-5.141-8.621C68.801,174.56,70.515,171.519,73.942,169.017z"></path> <path class="st0" d="M154.959,178.688c4.872,3.508,11.305,5.536,18.343,5.543c7.038-0.007,13.472-2.035,18.336-5.543 c4.843-3.472,8.242-8.672,8.242-14.689c0-6.017-3.399-11.225-8.242-14.696c-4.864-3.508-11.298-5.536-18.336-5.543 c-7.038,0.007-13.471,2.035-18.343,5.543c-4.843,3.471-8.242,8.679-8.242,14.696C146.718,170.016,150.123,175.216,154.959,178.688z M159.335,155.356c3.399-2.465,8.396-4.136,13.967-4.128c5.572-0.008,10.561,1.663,13.968,4.128 c3.427,2.502,5.142,5.55,5.142,8.643c0,3.085-1.714,6.134-5.142,8.635c-3.406,2.466-8.396,4.136-13.968,4.129 c-5.572,0.007-10.568-1.663-13.967-4.129c-3.435-2.501-5.149-5.55-5.149-8.635C154.186,160.906,155.907,157.858,159.335,155.356z"></path> <path class="st0" d="M97.938,254.446c0,7.089,4.004,13.26,9.817,17.432c5.842,4.208,13.617,6.674,22.129,6.68 c8.526-0.007,16.308-2.472,22.143-6.68c5.82-4.172,9.818-10.343,9.818-17.432s-3.997-13.26-9.818-17.432 c-5.834-4.208-13.617-6.673-22.143-6.681c-8.512,0.008-16.287,2.473-22.129,6.681C101.942,241.186,97.938,247.357,97.938,254.446z M112.131,243.068c4.369-3.172,10.7-5.274,17.753-5.266c7.068-0.008,13.398,2.094,17.774,5.266 c4.398,3.202,6.717,7.221,6.717,11.378c0,4.158-2.32,8.176-6.717,11.378c-4.376,3.173-10.707,5.273-17.774,5.266 c-7.053,0.007-13.384-2.093-17.753-5.266c-4.405-3.202-6.725-7.22-6.725-11.378C105.406,250.289,107.726,246.27,112.131,243.068z"></path> <path class="st0" d="M225.918,249.48c4.675,3.362,10.845,5.309,17.592,5.317c6.754-0.008,12.931-1.954,17.614-5.317 c4.646-3.333,7.928-8.352,7.928-14.157c0-5.806-3.275-10.824-7.928-14.164c-4.683-3.37-10.86-5.317-17.614-5.324 c-6.747,0.007-12.917,1.954-17.592,5.324c-4.654,3.34-7.936,8.351-7.936,14.164C217.982,241.128,221.264,246.146,225.918,249.48z M230.294,227.212c3.209-2.334,7.935-3.916,13.216-3.909c5.302-0.007,10.028,1.575,13.238,3.909 c3.238,2.363,4.836,5.223,4.836,8.111c0,2.881-1.597,5.733-4.836,8.096c-3.209,2.334-7.935,3.916-13.238,3.909 c-5.281,0.007-10.007-1.575-13.223-3.909c-3.238-2.363-4.836-5.215-4.836-8.096C225.451,232.435,227.048,229.575,230.294,227.212z"></path> <path class="st0" d="M292.202,198.453c6.302,4.537,14.711,7.207,23.93,7.214c9.219-0.007,17.636-2.677,23.938-7.214 c6.265-4.5,10.553-11.13,10.553-18.722c0-7.593-4.281-14.23-10.553-18.73c-6.302-4.544-14.718-7.213-23.938-7.221 c-9.219,0.008-17.628,2.677-23.93,7.221c-6.272,4.5-10.554,11.137-10.554,18.73C281.648,187.324,285.929,193.954,292.202,198.453z M296.578,167.055c4.828-3.508,11.794-5.813,19.554-5.806c7.76-0.007,14.733,2.298,19.561,5.806 c4.858,3.53,7.462,8.008,7.462,12.676c0,4.66-2.604,9.132-7.462,12.669c-4.828,3.501-11.801,5.806-19.561,5.799 c-7.76,0.007-14.726-2.298-19.554-5.799c-4.865-3.537-7.461-8.008-7.461-12.669C289.116,175.063,291.72,170.585,296.578,167.055z"></path> <path class="st0" d="M366.326,252.244c5.011,3.603,11.64,5.696,18.89,5.704c7.25-0.008,13.872-2.101,18.883-5.704 c4.974-3.574,8.46-8.92,8.46-15.09c0-6.17-3.486-11.516-8.46-15.09c-5.011-3.603-11.633-5.689-18.883-5.696 c-7.25,0.008-13.88,2.094-18.89,5.696c-4.974,3.574-8.46,8.92-8.46,15.09C357.866,243.324,361.352,248.67,366.326,252.244z M370.702,228.116c3.537-2.56,8.716-4.288,14.514-4.281c5.791-0.007,10.969,1.722,14.507,4.281 c3.566,2.604,5.368,5.784,5.368,9.037c0,3.246-1.801,6.433-5.368,9.037c-3.538,2.567-8.716,4.295-14.507,4.288 c-5.799,0.007-10.978-1.722-14.514-4.288c-3.566-2.604-5.368-5.791-5.368-9.037C365.334,233.9,367.136,230.721,370.702,228.116z"></path> <path class="st0" d="M403.392,175.516c5.185,3.727,12.056,5.9,19.576,5.908c7.512-0.008,14.382-2.181,19.561-5.908 c5.156-3.698,8.752-9.219,8.752-15.58c0-6.367-3.596-11.888-8.752-15.586c-5.179-3.734-12.049-5.9-19.561-5.908 c-7.512,0.008-14.39,2.174-19.576,5.908c-5.164,3.698-8.768,9.212-8.768,15.586C394.624,166.304,398.228,171.818,403.392,175.516z M407.76,150.404c3.72-2.692,9.146-4.501,15.207-4.493c6.054-0.008,11.473,1.801,15.192,4.493c3.742,2.727,5.653,6.09,5.653,9.532 c0,3.436-1.911,6.79-5.653,9.526c-3.719,2.692-9.138,4.5-15.192,4.493c-6.054,0.008-11.487-1.801-15.207-4.5 c-3.756-2.728-5.667-6.09-5.667-9.518C402.093,156.494,404.004,153.139,407.76,150.404z"></path> </g> </g></svg>
`;

type Mesa = {
    id: string;
    numero: number;
    estado: string;
    capacidad: number;
    imagen?: string;
    hora_pedido?: string;
};

export default function GarzonLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const screenWidth = Dimensions.get("window").width;
    const [showMesas, setShowMesas] = useState(false);
    const [showPedidos, setShowPedidos] = useState(false);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [pedidosTerminados, setPedidosTerminados] = useState<any[]>([]);
    const [loadingMesas, setLoadingMesas] = useState(false);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // Hook para notificaciones push
    const { showLocalNotification, registerGarzonToken, testNotification } = useNotifications();

    // Validación de rol y registro de token de notificaciones
    useEffect(() => {
        let isMounted = true;
        
        const checkRoleAndRegisterToken = async () => {
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr && isMounted) {
                    router.replace("/");
                    return;
                }
                if (!isMounted || !trabajadorStr) return;
                
                const trabajador = JSON.parse(trabajadorStr);
                if (trabajador.rol !== "garzon" && isMounted) {
                    router.replace("/");
                    return;
                }

                // Registrar token de notificaciones para garzón
                if (isMounted) {
                    const tokenRegistered = await AsyncStorage.getItem('garzonTokenRegistered');
                    
                    if (!tokenRegistered) {
                        console.log('🔔 Registrando token de notificaciones para garzón...');
                        
                        const success = await registerGarzonToken(
                            trabajador.user_id,
                            trabajador.restaurante_id,
                            trabajador.id || trabajador.trabajador_id
                        );

                        if (success) {
                            console.log('✅ Token de garzón registrado exitosamente');
                        } else {
                            console.log('❌ No se pudo registrar el token de garzón');
                        }
                    } else {
                        console.log('✅ Token de garzón ya está registrado');
                    }
                }
            } catch (error) {
                console.error("Error checking role and registering token:", error);
                if (isMounted) {
                    router.replace("/");
                }
            }
        };
        
        checkRoleAndRegisterToken();
        
        return () => {
            isMounted = false;
        };
    }, [router, registerGarzonToken]);

    // WebSocket para actualización de mesas y pedidos en tiempo real
    useEffect(() => {
        let isMounted = true;
        
        const connectWebSocket = async () => {
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr || !isMounted) return;
                
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id || !isMounted) return;

                // Cerrar conexión anterior si existe
                if (ws.current) {
                    ws.current.close();
                    ws.current = null;
                }

                ws.current = new WebSocket(`${Config.API_URL_WS}/ws/kitchen/${user_id}/${restaurante_id}`);

                ws.current.onopen = () => {
                    if (!isMounted) return;
                    console.log("WebSocket conectado (garzón)");
                    // Limpiar timeout de reconexión si existe
                    if (reconnectTimeout.current) {
                        clearTimeout(reconnectTimeout.current);
                        reconnectTimeout.current = null;
                    }
                };

                ws.current.onmessage = async (event) => {
                    if (!isMounted) return;
                    try {
                        const data = JSON.parse(event.data);
                        console.log("Mensaje WS recibido:", data);

                        // Si el evento es actualización de mesa, actualiza el estado de las mesas
                        if (data.evento === "actualizar_mesa" && data.mesa_id && data.estado) {
                            if (!isMounted) return;
                            setMesas(prevMesas =>
                                prevMesas.map(m =>
                                    m.id === data.mesa_id
                                        ? { ...m, estado: data.estado }
                                        : m
                                )
                            );
                        }

                        // Si el evento es pedido terminado, agrégalo a la lista de pedidos listos
                        if (data.evento === "pedido_terminado" || data.evento === "nuevo_pedido_terminado") {
                            if (!isMounted) return;
                            // Obtener detalles del pedido terminado directamente
                            const trabajadorStr = await AsyncStorage.getItem("trabajador");
                            if (!trabajadorStr || !isMounted) return;
                            const trabajador = JSON.parse(trabajadorStr);
                            const user_id = trabajador.user_id;
                            const restaurante_id = trabajador.restaurante_id;

                            try {
                                // Obtener detalles del pedido específico
                                const detalleRes = await fetch(
                                    `${Config.API_URL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${data.pedido_id}`
                                );
                                const detalleData = await detalleRes.json();
                                const detalle = detalleData.pedido_detalle;
                                
                                if (detalle && detalle.estado_actual === "terminado") {
                                    if (!isMounted) return;
                                    const nuevoPedido = {
                                        pedido_id: data.pedido_id,
                                        mesa_numero: detalle.mesa,
                                        platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                            nombre,
                                            cantidad: Number(cantidad),
                                        })),
                                        estado_actual: detalle.estado_actual,
                                        detalle: detalle.detalle || 'Sin detalle',
                                        hora_pedido: new Date().toLocaleTimeString() // Hora actual cuando llega
                                    };

                                    // Agregar el nuevo pedido a la lista (solo si no existe ya)
                                    setPedidosTerminados(prevPedidos => {
                                        const existePedido = prevPedidos.some(p => p.pedido_id === data.pedido_id);
                                        if (!existePedido) {
                                            return [nuevoPedido, ...prevPedidos];
                                        }
                                        return prevPedidos;
                                    });

                                    // Mostrar notificación al garzón solo si el componente está montado
                                    if (isMounted) {
                                        // Mostrar notificación push nativa (funciona con pantalla bloqueada)
                                        await showLocalNotification(
                                            "¡Pedido listo!",
                                            `Pedido #${data.pedido_id} de la mesa ${detalle.mesa} terminado`,
                                            { pedido_id: data.pedido_id, mesa: detalle.mesa }
                                        );
                                        
                                        // Usar setTimeout para evitar problemas de concurrencia
                                        setTimeout(async () => {
                                            if (isMounted) {
                                                try {
                                                    await Swal.fire({
                                                        title: "¡Pedido listo!",
                                                        text: `El pedido #${data.pedido_id} de la mesa ${detalle.mesa} está terminado y listo para entregar.`,
                                                        icon: "info",
                                                        timer: 3000,
                                                        showConfirmButton: true,
                                                        confirmButtonText: "Entendido",
                                                        confirmButtonColor: Colors.secondary,
                                                    });
                                                } catch (alertError) {
                                                    console.log("Error mostrando alerta:", alertError);
                                                }
                                            }
                                        }, 100);
                                    }
                                }
                            } catch (error) {
                                console.error("Error al obtener detalles del pedido terminado:", error);
                            }
                        }

                        // Si el evento es pedido entregado, removerlo de la lista
                        if (data.evento === "pedido_actualizado" && data.estado_actual === "entregado") {
                            if (!isMounted) return;
                            setPedidosTerminados(prevPedidos => 
                                prevPedidos.filter(p => p.pedido_id !== data.pedido_id)
                            );
                        }

                        // Si el evento es actualización de estado de pedido
                        if (data.evento === "pedido_actualizado") {
                            // Si el pedido cambió a terminado, agregarlo
                            if (data.estado_actual === "terminado") {
                                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                                if (!trabajadorStr) return;
                                const trabajador = JSON.parse(trabajadorStr);
                                const user_id = trabajador.user_id;
                                const restaurante_id = trabajador.restaurante_id;

                                try {
                                    const detalleRes = await fetch(
                                        `${Config.API_URL}/pedido/detalle?user_id=${user_id}&restaurante_id=${restaurante_id}&pedido_id=${data.pedido_id}`
                                    );
                                    const detalleData = await detalleRes.json();
                                    const detalle = detalleData.pedido_detalle;
                                    
                                    if (detalle) {
                                        const nuevoPedido = {
                                            pedido_id: data.pedido_id,
                                            mesa_numero: detalle.mesa,
                                            platos: Object.entries(detalle.platos).map(([nombre, cantidad]) => ({
                                                nombre,
                                                cantidad: Number(cantidad),
                                            })),
                                            estado_actual: detalle.estado_actual,
                                            detalle: detalle.detalle || 'Sin detalle',
                                            hora_pedido: new Date().toLocaleTimeString()
                                        };

                                        setPedidosTerminados(prevPedidos => {
                                            const existePedido = prevPedidos.some(p => p.pedido_id === data.pedido_id);
                                            if (!existePedido) {
                                                return [nuevoPedido, ...prevPedidos];
                                            }
                                            return prevPedidos;
                                        });

                                        await Swal.fire({
                                            title: "¡Pedido listo!",
                                            text: `El pedido #${data.pedido_id} de la mesa ${detalle.mesa} está terminado y listo para entregar.`,
                                            icon: "info",
                                            timer: 3000,
                                            showConfirmButton: true,
                                            confirmButtonText: "Entendido",
                                            confirmButtonColor: Colors.secondary,
                                        });
                                    }
                                } catch (error) {
                                    console.error("Error al obtener detalles del pedido actualizado:", error);
                                }
                            }
                            // Si el pedido cambió a entregado, removerlo
                            else if (data.estado_actual === "entregado") {
                                setPedidosTerminados(prevPedidos => 
                                    prevPedidos.filter(p => p.pedido_id !== data.pedido_id)
                                );
                            }
                        }
                    } catch (err) {
                        console.log("Error procesando mensaje WS:", err);
                    }
                };

                ws.current.onerror = (error) => {
                    if (!isMounted) return;
                    console.log("WebSocket error:", error);
                };

                ws.current.onclose = () => {
                    if (!isMounted) return;
                    console.log("WebSocket cerrado - intentando reconectar en 5 segundos...");
                    // Intentar reconectar después de 5 segundos
                    reconnectTimeout.current = setTimeout(() => {
                        if (isMounted) {
                            connectWebSocket();
                        }
                    }, 5000);
                };
            } catch (e) {
                if (!isMounted) return;
                console.log("Error al conectar WebSocket:", e);
                // Intentar reconectar después de 5 segundos en caso de error
                reconnectTimeout.current = setTimeout(() => {
                    if (isMounted) {
                        connectWebSocket();
                    }
                }, 5000);
            }
        };

        connectWebSocket();

        return () => {
            isMounted = false;
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, []);

    const handleMostrarMesas = async () => {
        try {
            setShowMesas(!showMesas);
            // Cerrar pedidos si está abierto
            if (showPedidos) setShowPedidos(false);
            
            if (!showMesas) {
                setLoadingMesas(true);
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id) return;

                const response = await fetch(
                    `${Config.API_URL}/mesa/all?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                // Adaptar la respuesta al array de mesas
                const mesasArray: Mesa[] = data.mesas
                    ? Object.entries(data.mesas).map(([id, mesa]: [string, any]) => ({
                        id,
                        numero: mesa.numero,
                        estado: mesa.estado,
                        capacidad: mesa.capacidad,
                        imagen: mesa.imagen,
                        hora_pedido: mesa.hora_pedido,
                    }))
                    : [];
                setMesas(mesasArray);
            }
        } catch (error) {
            handleError(error, 'cargar mesas');
            setMesas([]);
        } finally {
            setLoadingMesas(false);
        }
    };

    const handleMostrarPedidos = async () => {
        setShowPedidos(!showPedidos);
        // Cerrar mesas si está abierto
        if (showMesas) setShowMesas(false);
        
        if (!showPedidos) {
            setLoadingPedidos(true);
            try {
                const trabajadorStr = await AsyncStorage.getItem("trabajador");
                if (!trabajadorStr) return;
                const trabajador = JSON.parse(trabajadorStr);
                const user_id = trabajador.user_id;
                const restaurante_id = trabajador.restaurante_id;
                if (!user_id || !restaurante_id) return;

                // 1. Obtener todos los pedidos
                const response = await fetch(
                    `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
                );
                const data = await response.json();
                
                // 2. Filtrar y formatear pedidos terminados directamente
                const pedidosTerminadosArray = Object.entries(data.pedidos)
                    .filter(([_, pedido]: [string, any]) => pedido.estados?.estado_actual === "terminado")
                    .map(([pedido_id, pedido]: [string, any]) => {
                        // Obtener información de la mesa (necesitarías hacer un fetch adicional para obtener el número)
                        // Por ahora usamos el mesa_id, pero podrías optimizar esto también
                        return {
                            pedido_id,
                            mesa_numero: pedido.mesa_id, // Aquí podrías mapear el ID a número si tienes esa info
                            platos: Object.entries(pedido.platos).map(([plato_id, platoInfo]: [string, any]) => ({
                                nombre: plato_id, // Aquí también podrías mapear el ID al nombre real del plato
                                cantidad: platoInfo.cantidad,
                            })),
                            estado_actual: pedido.estados.estado_actual,
                            detalle: pedido.detalle || 'Sin detalle',
                            hora_pedido: pedido.estados.terminado ? 
                                new Date(pedido.estados.terminado).toLocaleTimeString() : 
                                'No especificada'
                        };
                    });

                setPedidosTerminados(pedidosTerminadosArray);
                
            } catch (e) {
                console.error("Error al cargar pedidos terminados:", e);
                setPedidosTerminados([]);
            } finally {
                setLoadingPedidos(false);
            }
        }
    };

    const handleEntregarPedido = async (pedido_id: string) => {
        const result = await Swal.fire({
            title: "Confirmar entrega",
            text: "¿Confirmas que el pedido ha sido entregado al cliente?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, entregado",
            cancelButtonText: "Cancelar",
            confirmButtonColor: Colors.secondary,
            cancelButtonColor: Colors.grey,
        });

        if (!result.isConfirmed) return;

        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;

            const response = await fetch(
                `${Config.API_URL}/pedido`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pedido_id,
                        user_id,
                        restaurante_id,
                        estado_actual: 3 // Estado entregado
                    })
                }
            );
            
            if (response.ok) {
                // Eliminar el pedido de la lista
                setPedidosTerminados(prev => 
                    prev.filter(p => p.pedido_id !== pedido_id)
                );
                await Swal.fire({
                    title: "¡Éxito!",
                    text: "Pedido marcado como entregado",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                await Swal.fire({
                    title: "Error",
                    text: "No se pudo actualizar el estado del pedido",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
            }
        } catch (e) {
            await Swal.fire({
                title: "Error de conexión",
                text: "No se pudo conectar al servidor",
                icon: "error",
                confirmButtonColor: Colors.primary,
            });
        }
    };

    // Función para probar notificaciones
    const handleTestNotification = async () => {
        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            
            const trabajador = JSON.parse(trabajadorStr);
            
            const result = await testNotification(
                trabajador.user_id,
                trabajador.restaurante_id
            );

            if (result) {
                await Swal.fire({
                    title: "🔔 Notificación enviada",
                    text: "Se ha enviado una notificación de prueba a todos los garzones",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else {
                await Swal.fire({
                    title: "❌ Error",
                    text: "No se pudo enviar la notificación de prueba",
                    icon: "error",
                    confirmButtonColor: Colors.primary,
                });
            }
        } catch (error) {
            console.error("Error en prueba de notificación:", error);
            await Swal.fire({
                title: "❌ Error",
                text: "Error enviando notificación de prueba",
                icon: "error",
                confirmButtonColor: Colors.primary,
            });
        }
    };

    // Función para diagnosticar notificaciones
    const handleDiagnosticarNotificaciones = async () => {
        try {
            await Swal.fire({
                title: "🔍 Ejecutando diagnóstico...",
                text: "Verificando configuración de notificaciones",
                icon: "info",
                timer: 2000,
                showConfirmButton: false,
            });

            

            
        } catch (error) {
            console.error("Error en diagnóstico:", error);
            await Swal.fire({
                title: "❌ Error",
                text: "Error ejecutando diagnóstico de notificaciones",
                icon: "error",
                confirmButtonColor: Colors.primary,
            });
        }
    };

    const handleMesaPress = (mesa: Mesa) => {
        Alert.alert(
            `Mesa #${mesa.numero}`,
            `Estado: ${mesa.estado}\n${mesa.hora_pedido ? `Hora del pedido: ${mesa.hora_pedido}` : ""}`
        );
    };

    const getMesaSVG = (estado: string) => {
        if (estado === "disponible") return <SvgXml xml={mesaDisponibleSVG} width={60} height={60} />;
        if (estado === "ocupado") return <SvgXml xml={mesaOcupadaSVG} width={60} height={60} />;
        if (estado === "pagado") return <SvgXml xml={mesaPagadaSVG} width={60} height={60} />;
        return <Icon color={Colors.primary} size={60} />;
    };

    // Función para refrescar pedidos terminados
    const refreshPedidosTerminados = async () => {
        try {
            const trabajadorStr = await AsyncStorage.getItem("trabajador");
            if (!trabajadorStr) return;
            const trabajador = JSON.parse(trabajadorStr);
            const user_id = trabajador.user_id;
            const restaurante_id = trabajador.restaurante_id;
            if (!user_id || !restaurante_id) return;

            const response = await fetch(
                `${Config.API_URL}/pedidos/?user_id=${user_id}&restaurante_id=${restaurante_id}`
            );
            const data = await response.json();
            
            const pedidosTerminadosArray = Object.entries(data.pedidos)
                .filter(([_, pedido]: [string, any]) => pedido.estados?.estado_actual === "terminado")
                .map(([pedido_id, pedido]: [string, any]) => ({
                    pedido_id,
                    mesa_numero: pedido.mesa_id,
                    platos: Object.entries(pedido.platos).map(([plato_id, platoInfo]: [string, any]) => ({
                        nombre: plato_id,
                        cantidad: platoInfo.cantidad,
                    })),
                    estado_actual: pedido.estados.estado_actual,
                    detalle: pedido.detalle || 'Sin detalle',
                    hora_pedido: pedido.estados.terminado ? 
                        new Date(pedido.estados.terminado).toLocaleTimeString() : 
                        'No especificada'
                }));

            setPedidosTerminados(pedidosTerminadosArray);
        } catch (e) {
            console.error("Error al refrescar pedidos terminados:", e);
        }
    };

    // Auto-refresh cada 30 segundos cuando se muestran los pedidos
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showPedidos) {
            interval = setInterval(() => {
                refreshPedidosTerminados();
            }, 30000); // Refrescar cada 30 segundos
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showPedidos]);

    return (
        <View style={styles.container}>
            {/* Header con icono Shoku */}
            <View style={styles.header}>
                <Icon color={Colors.light_primary} size={70} />
                <Text style={styles.headerText}>Shoku</Text>
            </View>
            {/* Botones principales en vertical */}
            <ScrollView contentContainerStyle={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { width: screenWidth * 0.8 }]}
                    onPress={handleMostrarMesas}
                >
                    <Text style={styles.buttonText}>Mesas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, { width: screenWidth * 0.8 }]}
                    onPress={handleMostrarPedidos}
                >
                    <Text style={styles.buttonText}>Ver Pedidos</Text>
                </TouchableOpacity>
                
                
                {/* Mostrar mesas */}
                {showMesas && (
                    <View style={{ width: "100%", marginTop: 16 }}>
                        {loadingMesas ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>Cargando mesas...</Text>
                        ) : mesas.length === 0 ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>No hay mesas disponibles.</Text>
                        ) : (
                            mesas.map((mesa) => (
                                <TouchableOpacity
                                    key={mesa.id || mesa.numero}
                                    style={styles.mesaCard}
                                    onPress={() => handleMesaPress(mesa)}
                                >
                                    <View style={{ marginRight: 16 }}>
                                        {getMesaSVG(mesa.estado)}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.mesaTitle}>Mesa #{mesa.numero}</Text>
                                        <Text style={styles.mesaText}>Estado: {mesa.estado}</Text>
                                        <Text style={styles.mesaText}>Capacidad: {mesa.capacidad}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {/* Mostrar pedidos terminados */}
                {showPedidos && (
                    <View style={{ width: "100%", marginTop: 16 }}>
                        {loadingPedidos ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>Cargando pedidos...</Text>
                        ) : pedidosTerminados.length === 0 ? (
                            <Text style={{ textAlign: "center", color: Colors.primary }}>No hay pedidos listos para entregar.</Text>
                        ) : (
                            pedidosTerminados.map((pedido) => (
                                <View key={pedido.pedido_id} style={styles.pedidoCard}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pedidoTitle}>Pedido #{pedido.pedido_id}</Text>
                                        <Text style={styles.pedidoText}>Mesa: {pedido.mesa_numero}</Text>
                                        <Text style={styles.pedidoText}>Detalle: {pedido.detalle}</Text>
                                        <Text style={styles.pedidoSubtitle}>Platos:</Text>
                                        {pedido.platos.map((plato: any, idx: number) => (
                                            <Text key={idx} style={styles.platoText}>
                                                • {plato.nombre} x {plato.cantidad}
                                            </Text>
                                        ))}
                                        <Text style={styles.pedidoText}>Hora: {pedido.hora_pedido}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.entregarButton}
                                        onPress={() => handleEntregarPedido(pedido.pedido_id)}
                                    >
                                        <Text style={styles.entregarButtonText}>Entregar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
            {/* Contenido de la página */}
            <View style={{ flex: 1 }}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg_light,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        backgroundColor: Colors.primary,
    },
    icon: {
        marginRight: 12,
    },
    headerText: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "bold",
        letterSpacing: 2,
    },
    buttonContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
        elevation: 2,
    },
    testButton: {
        backgroundColor: Colors.secondary,
    },
    diagnosticButton: {
        backgroundColor: Colors.yellow,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    mesaCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        alignItems: "center",
        elevation: 2,
    },
    mesaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 2,
    },
    mesaText: {
        fontSize: 15,
        color: Colors.primary,
        marginBottom: 1,
    },
    pedidoCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        alignItems: "flex-start",
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
    },
    pedidoTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primary,
        marginBottom: 6,
    },
    pedidoText: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 4,
    },
    pedidoSubtitle: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.primary,
        marginTop: 6,
        marginBottom: 4,
    },
    platoText: {
        fontSize: 13,
        color: Colors.grey,
        marginLeft: 8,
        marginBottom: 2,
    },
    entregarButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 12,
        alignSelf: "center",
    },
    entregarButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});