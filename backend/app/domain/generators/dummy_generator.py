NAMES = [
    "Rahul Sharma", "Amit Verma", "Priya Singh", "Sneha Patel",
    "Vikram Joshi", "Ananya Gupta", "Rohit Kumar", "Neha Kapoor",
    "Arjun Reddy", "Kavita Nair", "Manish Tiwari", "Pooja Mehta",
    "Suresh Iyer", "Deepa Menon", "Akash Desai",
]

COMPANIES = [
    "TechBridge", "WebSoft", "DataCore", "CloudNine",
    "AppForge", "NetPulse", "InnoSys", "BrightPath",
    "SwiftLogix", "NovaTech",
]


def generate_dummy_value(header: str, row_index: int) -> str:
    h = header.lower().strip()

    if "email" in h:
        return f"user{row_index}@example.com"

    if "name" in h:
        return NAMES[(row_index - 1) % len(NAMES)]

    if "group" in h:
        return f"Group {row_index}"

    if "company" in h:
        return f"{COMPANIES[(row_index - 1) % len(COMPANIES)]} {row_index}"

    return f"{header.strip()} {row_index}"
