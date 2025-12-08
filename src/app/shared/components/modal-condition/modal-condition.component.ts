import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IOptionModalCondition, ModalConditionService } from './modal-condition.service';

@Component({
  selector: 'app-modal-condition',
  standalone: false,
  templateUrl: './modal-condition.component.html',
  styleUrl: './modal-condition.component.scss'
})
export class ModalConditionComponent implements OnInit {
  @Input() isLoading = false
  @Input() isBtnUploadSuccess = false

  @Output() onConfirm = new EventEmitter<string>()

  optionModal!: IOptionModalCondition

  constructor(
    private modalConditionService: ModalConditionService
  ) { }

  ngOnInit(): void {
    this.modalConditionService.isOpen.subscribe(t => this.optionModal = t)
  }

  onClose() {
    this.modalConditionService.close(this.optionModal)
  }

  onConfirmClick(flag: string) {
    // this.modalConditionService.close(this.optionModal)
    this.onConfirm?.emit(flag)
  }
}
