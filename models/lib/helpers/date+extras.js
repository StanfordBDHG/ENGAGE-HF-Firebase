//
// This source file is part of the ENGAGE-HF project based on the Stanford Spezi Template Application project
//
// SPDX-FileCopyrightText: 2023 Stanford University
//
// SPDX-License-Identifier: MIT
//
export function advanceDateByDays(date, days) {
    return advanceDateBySeconds(date, days * 24 * 60 * 60);
}
export function advanceDateByHours(date, minutes) {
    return advanceDateBySeconds(date, minutes * 60 * 60);
}
export function advanceDateByMinutes(date, minutes) {
    return advanceDateBySeconds(date, minutes * 60);
}
export function advanceDateBySeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
}
