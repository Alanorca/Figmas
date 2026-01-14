import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  signal,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AvatarModule } from "primeng/avatar";
import { ButtonModule } from "primeng/button";

interface NavItem {
  id: string;
  label: string;
}

@Component({
  selector: "tabs-and-actions",
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarModule, ButtonModule],
  template: `
    <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-80">
      <div
        class="max-w-xl mx-auto bg-surface-0 dark:bg-surface-900 shadow-sm rounded-2xl overflow-hidden flex flex-col p-6"
      >
        <div class="pb-6 flex items-center justify-between">
          <h3
            class="text-lg text-surface-900 dark:text-surface-0 font-medium leading-tight"
          >
            Notification
          </h3>
        </div>

        <div
          class="relative border-t border-surface-200 dark:border-surface-700"
        >
          <div #scrollContainer class="overflow-x-auto">
            <ul class="p-0 m-0 list-none flex select-none min-w-max relative">
              @for (navItem of navs(); track navItem.id; let index = $index) {
              <li #tabRef>
                <a
                  class="cursor-pointer py-4 px-4 flex items-center transition-colors duration-150 hover:text-primary font-medium leading-normal"
                  [ngClass]="{
                    'text-primary font-semibold': selectedNav() === navItem.id,
                    'text-surface-900 dark:text-surface-0':
                      selectedNav() !== navItem.id
                  }"
                  (click)="setActiveTab(index)"
                >
                  <span>{{ navItem.label }}</span>
                </a>
              </li>
              }
              <div
                class="absolute bottom-0 rounded-lg h-[2px] bg-primary transition-transform duration-300 ease-in-out z-20"
                [style.width.px]="indicatorWidth()"
                [style.transform]="'translateX(' + indicatorLeft() + 'px)'"
              ></div>
            </ul>
          </div>
          <div
            class="absolute bottom-0 left-0 w-full h-px bg-surface-200 dark:bg-surface-700"
          ></div>
        </div>

        <div class="p-6 px-3 flex flex-col gap-6 md:p-6">
          <div class="flex flex-col gap-4">
            <div
              class="uppercase text-sm font-medium text-surface-500 dark:text-surface-400"
            >
              TODAY
            </div>

            <div class="flex gap-4 py-4 flex-col md:flex-row">
              <p-avatar
                image="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-6.png"
                shape="square"
                size="large"
                class="w-10 h-10 rounded-lg"
              ></p-avatar>
              <div class="flex-1 flex flex-col gap-2">
                <div
                  class="text-surface-900 dark:text-surface-0 font-medium leading-tight"
                >
                  Jane Cooper
                </div>
                <div
                  class="text-surface-900 dark:text-surface-200 leading-normal"
                >
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </div>
                <div class="text-surface-500 dark:text-surface-400 text-sm">
                  Oct 11 at 06:35 PM
                </div>
              </div>
            </div>

            <div class="flex gap-4 py-4 flex-col md:flex-row">
              <p-avatar
                image="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-m-2.png"
                shape="square"
                size="large"
                class="w-10 h-10 rounded-lg"
              ></p-avatar>
              <div class="flex-1 flex flex-col gap-2">
                <div
                  class="text-surface-900 dark:text-surface-0 font-medium leading-tight"
                >
                  Robert Fox
                </div>
                <div
                  class="text-surface-900 dark:text-surface-200 leading-normal"
                >
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur.
                </div>

                <div
                  class="flex gap-4 p-3 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg flex-col md:flex-row"
                >
                  <img
                    class="w-full md:w-[108px] h-20 rounded-lg object-cover"
                    src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/feed/feed-image.jpg"
                    alt="Image"
                  />
                  <div class="flex-1 flex flex-col gap-2">
                    <div
                      class="text-surface-900 dark:text-surface-0 text-sm leading-normal"
                    >
                      Potenti porttitor placerat eros suscipit pulvinar ad
                      maximus.
                    </div>
                    <div class="text-surface-500 dark:text-surface-400 text-xs">
                      Sep 11 at 04:22 PM
                    </div>
                  </div>
                </div>

                <div class="text-surface-500 dark:text-surface-400 text-sm">
                  Oct 11 at 02:40 PM
                </div>
              </div>
            </div>

            <div class="flex gap-4 py-4 flex-col md:flex-row">
              <p-avatar
                image="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-10.png"
                shape="square"
                size="large"
                class="w-10 h-10 rounded-lg"
              ></p-avatar>
              <div class="flex-1 flex flex-col gap-2">
                <div
                  class="text-surface-900 dark:text-surface-0 font-medium leading-tight"
                >
                  Kristin Watson
                </div>
                <div
                  class="text-surface-900 dark:text-surface-200 leading-normal"
                >
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum.
                </div>
                <div class="text-surface-500 dark:text-surface-400 text-sm">
                  Oct 11 at 11:28 AM
                </div>

                <div class="flex gap-4 mt-4">
                  <button pButton class="flex-1" severity="secondary">
                    <span pButtonLabel>Cancel</span>
                  </button>
                  <button pButton class="flex-1" severity="primary">
                    <span pButtonLabel>Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div
              class="uppercase text-sm font-medium text-surface-500 dark:text-surface-400"
            >
              YESTERDAY
            </div>

            <div class="flex gap-4 py-4 flex-col md:flex-row">
              <p-avatar
                image="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-4.png"
                shape="square"
                size="large"
                class="w-10 h-10 rounded-lg"
              ></p-avatar>
              <div class="flex-1 flex flex-col gap-2">
                <div
                  class="text-surface-900 dark:text-surface-0 font-medium leading-tight"
                >
                  Cody Robertson
                </div>
                <div
                  class="text-surface-900 dark:text-surface-200 leading-normal"
                >
                  Natoque interdum venenatis nec nunc aliquam natoque.
                </div>
                <div class="text-surface-500 dark:text-surface-400 text-sm">
                  Oct 10 at 11:58 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TabsandActions implements AfterViewInit {
  @ViewChild("scrollContainer") scrollContainer!: ElementRef<HTMLDivElement>;

  navs = signal<NavItem[]>([
    {
      id: "inbox",
      label: "Inbox",
    },
    {
      id: "following",
      label: "Following",
    },
    {
      id: "all",
      label: "All",
    },
    {
      id: "archived",
      label: "Archived",
    },
  ]);

  selectedNav = signal("inbox");
  indicatorWidth = signal(0);
  indicatorLeft = signal(0);

  ngAfterViewInit() {
    setTimeout(() => this.updateIndicator(), 0);
  }

  private updateIndicator(): void {
    const activeIndex = this.navs().findIndex(
      (item) => item.id === this.selectedNav()
    );
    const tabElements =
      this.scrollContainer.nativeElement.querySelectorAll("li");

    if (tabElements[activeIndex]) {
      const activeTab = tabElements[activeIndex].querySelector(
        "a"
      ) as HTMLElement;
      if (activeTab) {
        this.indicatorWidth.set(activeTab.offsetWidth);
        this.indicatorLeft.set(activeTab.offsetLeft);
      }
    }
  }

  setActiveTab = (index: number): void => {
    this.selectedNav.set(this.navs()[index].id);

    setTimeout(() => {
      const tabElements =
        this.scrollContainer.nativeElement.querySelectorAll("li");
      if (tabElements[index]) {
        const tab = tabElements[index].querySelector("a") as HTMLElement;
        const container = this.scrollContainer.nativeElement;

        if (tab.offsetLeft < container.scrollLeft) {
          container.scrollTo({ left: tab.offsetLeft, behavior: "smooth" });
        } else if (
          tab.offsetLeft + tab.offsetWidth >
          container.scrollLeft + container.offsetWidth
        ) {
          container.scrollTo({
            left: tab.offsetLeft - container.offsetWidth + tab.offsetWidth,
            behavior: "smooth",
          });
        }
      }
      this.updateIndicator();
    }, 0);
  };
}
